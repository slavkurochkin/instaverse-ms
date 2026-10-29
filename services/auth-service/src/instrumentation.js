import process from 'node:process';
import dotenv from 'dotenv';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';

dotenv.config();

const serviceName = process.env.OTEL_SERVICE_NAME || 'auth-service';
const baseOtlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.replace(/\/$/, '') || 'http://jaeger:4318';
const traceEndpoint =
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || `${baseOtlpEndpoint}/v1/traces`;

const sdk = new NodeSDK({
  serviceName,
  resource: resourceFromAttributes({
    'service.version': process.env.npm_package_version || '1.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  }),
  traceExporter: new OTLPTraceExporter({
    url: traceEndpoint,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();

let shuttingDown = false;

const shutdownOtel = async (signal) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  try {
    await sdk.shutdown();
    console.log(`[otel] ${serviceName} telemetry shut down after ${signal}`);
  } catch (error) {
    console.error(`[otel] ${serviceName} telemetry shutdown failed`, error);
  }
};

process.on('SIGTERM', () => {
  void shutdownOtel('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdownOtel('SIGINT');
});
