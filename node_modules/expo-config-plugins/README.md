# Expo Config Plugins

This project provides a collection of custom Expo config plugins to integrate Google Maps, React Native Firebase, and additional Android permissions (such as `usesClearTextTraffic`) into an Expo-managed project.

## Overview

Expo Config Plugins enable you to customize and extend the native behavior of an Expo project without ejecting. These plugins automatically modify native files during the build process, allowing you to integrate native modules that require additional configurations.

### Included Plugins

1. **Google Maps Integration**
2. **React Native Firebase Integration**
3. **Enabling usesClearTextTraffic (Android)**

## Setup

To use these plugins in your Expo project, follow the steps below:

### 1. Install the Required Packages

You need to install Expo config plugins to utilize the custom plugins.

```bash
npm install expo-config-plugins
```

### 2. Add the Plugins to `app.json` or `app.config.js`

In your project's `app.json` or `app.config.js`, add the respective plugin configurations:

#### Google Maps Plugin

```json
{
  "expo": {
    "plugins": [
      [
        "expo-config-plugins/lib/with-google-maps",
        {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      ]
    ]
  }
}
```

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API key.

#### React Native Firebase Plugin

```json
{
  "expo": {
    "plugins": [
      "expo-config-plugins/lib/with-react-native-firebase"
    ]
  }
}
```

#### Android Cleartext Traffic Permission Plugin

```json
{
  "expo": {
    "plugins": [
      "expo-config-plugins/lib/with-uses-cleartext-traffic"
    ]
  }
}
```

This will allow Android apps to use cleartext network traffic.

### 3. Usage

Once the plugins are added to your configuration, Expo will automatically apply the necessary changes to the native project files during the build process.

### 4. Building the App

After setting up the configuration, run the following command to build your app:

```bash
eas build -p android|ios
```

This will generate and modify the native files required for the integrations to work.

## Plugin Details

### 1. Google Maps Integration (`with-google-maps`)

- **iOS**: Adds Google Maps dependencies to the `Podfile` and updates `AppDelegate.mm` to configure the API key.
- **Android**: Adds the Google Maps API key to the `AndroidManifest.xml`.

### 2. React Native Firebase Integration (`with-react-native-firebase`)

- **iOS**: Configures Firebase to be used as a static framework and modifies `AppDelegate.mm` to initialize Firebase.

> **Note**: The Android configuration for Firebase has been commented out in the code. You can enable it by uncommenting the relevant parts in `src/with-react-native-firebase.ts` if needed.

### 3. Android Cleartext Traffic (`with-uses-cleartext-traffic`)

- **Android**: Enables cleartext traffic by setting `android:usesCleartextTraffic` to `true` in the `AndroidManifest.xml`.

## Customization

You can modify these plugins to fit your own project needs. Each plugin is located in the `src` directory:

- **Google Maps**: `src/with-google-maps.ts`
- **React Native Firebase**: `src/with-react-native-firebase.ts`
- **Cleartext Traffic**: `src/with-uses-cleartext-traffic.ts`

If you need to further customize the way the plugins modify native files, you can adjust the `mergeContentsAndSaveAsync` utility and the plugin logic directly.

## License

This project is licensed under the MIT License.
