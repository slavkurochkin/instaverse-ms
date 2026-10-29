import {
  ROOT_CONTEXT,
  context,
  trace,
  SpanStatusCode,
} from '@opentelemetry/api';
import { getSessionTraceAttributes } from './tracingSession';

const tracer = trace.getTracer('instaverse-navigation');
const AUTO_CLOSE_MS = 5000;

let pendingNavigation = null;
let pendingNavigationTimer = null;

const clearPendingTimer = () => {
  if (pendingNavigationTimer) {
    window.clearTimeout(pendingNavigationTimer);
    pendingNavigationTimer = null;
  }
};

const getElementAttributes = (eventInfo) => {
  const attrs = {};

  if (eventInfo?.key) {
    attrs['app.navigation.menu_key'] = String(eventInfo.key);
  }

  const domTarget = eventInfo?.domEvent?.target;
  if (!(domTarget instanceof Element)) {
    return attrs;
  }

  const element =
    domTarget.closest('[role="menuitem"]') ||
    domTarget.closest('li') ||
    domTarget;

  if (element?.tagName) {
    attrs['app.navigation.clicked_tag'] = element.tagName.toLowerCase();
  }

  const text = element?.textContent?.trim();
  if (text) {
    attrs['app.navigation.clicked_text'] = text;
  }

  const role = element?.getAttribute('role');
  if (role) {
    attrs['app.navigation.clicked_role'] = role;
  }

  const className =
    typeof element?.className === 'string' ? element.className.trim() : '';
  if (className) {
    attrs['app.navigation.clicked_class'] = className;
  }

  return attrs;
};

const closePendingNavigation = (
  status = SpanStatusCode.UNSET,
  attributes = {},
) => {
  if (!pendingNavigation) {
    return;
  }

  const { span } = pendingNavigation;

  Object.entries(attributes).forEach(([key, value]) => {
    span.setAttribute(key, value);
  });

  if (status !== SpanStatusCode.UNSET) {
    span.setStatus({ code: status });
  }

  span.end();
  pendingNavigation = null;
  clearPendingTimer();
};

export const startNavigationTrace = ({ label, target, source, eventInfo }) => {
  closePendingNavigation(SpanStatusCode.ERROR, {
    'app.navigation.abandoned': true,
  });

  const elementAttributes = getElementAttributes(eventInfo);

  const span = tracer.startSpan(
    `menu.navigate.${label.toLowerCase()}`,
    {
      attributes: {
        'app.navigation.label': label,
        'app.navigation.source': source,
        'app.navigation.target': target,
        ...getSessionTraceAttributes(),
        ...elementAttributes,
      },
    },
    ROOT_CONTEXT,
  );

  pendingNavigation = {
    span,
    ctx: trace.setSpan(ROOT_CONTEXT, span),
  };

  clearPendingTimer();
  pendingNavigationTimer = window.setTimeout(() => {
    closePendingNavigation(SpanStatusCode.UNSET, {
      'app.navigation.timeout': true,
    });
  }, AUTO_CLOSE_MS);
};

export const consumeNavigationTrace = async (callback) => {
  if (!pendingNavigation) {
    return callback(null);
  }

  const currentNavigation = pendingNavigation;
  pendingNavigation = null;
  clearPendingTimer();

  return context.with(currentNavigation.ctx, async () => {
    try {
      currentNavigation.span.addEvent('navigation.context.consumed');
      const result = await callback(currentNavigation.span);
      currentNavigation.span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      currentNavigation.span.recordException(error);
      currentNavigation.span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      throw error;
    } finally {
      currentNavigation.span.end();
    }
  });
};
