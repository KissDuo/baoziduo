FROM node:18-alpine

WORKDIR /app

# Copy standalone Next.js output (includes built frontend + its node_modules)
COPY apps/web/.next/standalone/english-learning-platform/ ./

# Copy backend dist + node_modules
COPY apps/server/dist ./apps/server/dist/
COPY apps/server/package.json ./apps/server/
COPY apps/server/node_modules ./apps/server/node_modules/

# Copy public static files
COPY apps/web/.next/static ./apps/web/.next/static/

# Copy prisma for runtime
COPY apps/server/prisma ./apps/server/prisma/
COPY apps/server/node_modules/.prisma ./apps/server/node_modules/.prisma/

# Startup script
RUN echo '#!/bin/sh' > /start.sh \
  && echo 'set -e' >> /start.sh \
  && echo 'cd /app/apps/server && node dist/index.js &' >> /start.sh \
  && echo 'cd /app/apps/web && PORT=5200 node server.js' >> /start.sh \
  && chmod +x /start.sh

EXPOSE 5200 5201

CMD ["/start.sh"]
