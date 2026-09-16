FROM node:20-bookworm
ENV DEBIAN_FRONTEND=noninteractive \
    ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    GRADLE_HOME=/opt/gradle \
    PATH=/opt/gradle/bin:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools:/opt/android-sdk/build-tools/35.0.0:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless wget unzip zip libreoffice-writer poppler-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${GRADLE_HOME} ${ANDROID_HOME}/cmdline-tools \
    && wget -q https://services.gradle.org/distributions/gradle-8.10-bin.zip -O /tmp/gradle.zip \
    && unzip -q /tmp/gradle.zip -d /opt \
    && ln -s /opt/gradle-8.10/bin ${GRADLE_HOME}/bin \
    && rm /tmp/gradle.zip \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/sdk.zip \
    && unzip -q /tmp/sdk.zip -d ${ANDROID_HOME}/cmdline-tools \
    && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm /tmp/sdk.zip \
    && yes | sdkmanager --licenses >/dev/null || true \
    && sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

WORKDIR /app
COPY package*.json ./
RUN npm install && npx playwright install --with-deps chromium
COPY . .
RUN cd android/template && gradle wrapper --gradle-version 8.10
RUN mkdir -p data/uploads data/work data/outputs
ENV PORT=10000
EXPOSE 10000
CMD ["npm","start"]
