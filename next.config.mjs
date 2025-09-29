import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {};

export default withSentryConfig(nextConfig, {
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: false,
});
