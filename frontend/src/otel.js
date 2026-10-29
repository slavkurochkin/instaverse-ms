import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

const otelEnabled = process.env.REACT_APP_OTEL_ENABLED !== 'false';
const collectorUrl =
  process.env.REACT_APP_OTEL_EXPORTER_OTLP_ENDPOINT ||
  'http://localhost:4318/v1/traces';
const apiTarget =
  process.env.REACT_APP_OTEL_PROPAGATION_TARGET || 'http://localhost:8000';
const serviceName =
  process.env.REACT_APP_OTEL_SERVICE_NAME || 'instaverse-frontend';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const propagationTargetPattern = new RegExp(`^${escapeRegex(apiTarget)}(/|$)`);
const collectorIgnorePattern = new RegExp(`^${escapeRegex(collectorUrl)}$`);

if (otelEnabled) {
  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      'service.name': serviceName,
      'service.version': process.env.npm_package_version || '0.1.0',
      'deployment.environment': process.env.NODE_ENV || 'development',
    }),
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: collectorUrl,
        }),
      ),
    ],
  });

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation(),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [propagationTargetPattern],
        ignoreUrls: [collectorIgnorePattern],
        clearTimingResources: true,
      }),
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: [propagationTargetPattern],
        ignoreUrls: [collectorIgnorePattern],
      }),
    ],
  });
}
