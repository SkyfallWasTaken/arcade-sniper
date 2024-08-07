FROM mcr.microsoft.com/playwright:v1.46.0-jammy

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

# Copy package.json and bun.lockb (if you have one)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --production

# Copy the rest of your application
COPY . .

# Set the command to run your script
CMD ["tsx", "src/index.ts"]