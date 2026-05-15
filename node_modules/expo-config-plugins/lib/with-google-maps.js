"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const config_plugins_1 = require("@expo/config-plugins");
const utils_1 = require("./utils");
const withGoogleMapsIOS = (conf, { apiKey }) => {
    return (0, config_plugins_1.withDangerousMod)(conf, [
        'ios',
        (config) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, utils_1.mergeContentsAndSaveAsync)(path_1.default.join(config.modRequest.platformProjectRoot, 'Podfile'), {
                tag: 'google-maps-podfile',
                newSrc: [
                    '  # React Native Maps dependencies',
                    '  # The following line is only needed if building on an Apple silicon Mac without rosetta.',
                    "  pod 'Google-Maps-iOS-Utils', :git => 'https://github.com/Simon-TechForm/google-maps-ios-utils.git', :branch => 'feat/support-apple-silicon'",
                    '  ',
                    "  rn_maps_path = '../node_modules/react-native-maps'",
                    "  pod 'react-native-google-maps', :path => rn_maps_path",
                ].join('\n'),
                anchor: /use_native_modules!/,
                offset: 0,
                comment: '  #',
            });
            yield (0, utils_1.mergeContentsAndSaveAsync)(path_1.default.join(config.modRequest.platformProjectRoot, config.modRequest.projectName, 'AppDelegate.mm'), {
                tag: 'google-maps-import',
                newSrc: '#import <GoogleMaps/GoogleMaps.h>',
                anchor: '#import "AppDelegate.h"',
                offset: 1,
                comment: '//',
            });
            yield (0, utils_1.mergeContentsAndSaveAsync)(path_1.default.join(config.modRequest.platformProjectRoot, config.modRequest.projectName, 'AppDelegate.mm'), {
                tag: 'google-maps-provide-api-key',
                newSrc: `  [GMSServices provideAPIKey:@"${apiKey}"];`,
                anchor: /didFinishLaunchingWithOptions/,
                offset: 2,
                comment: '  //',
            });
            return config;
        }),
    ]);
};
const { getMainApplicationOrThrow, addMetaDataItemToMainApplication } = config_plugins_1.AndroidConfig.Manifest;
const withGoogleMapsAndroid = (config, { apiKey }) => {
    return (0, config_plugins_1.withAndroidManifest)(config, (modConfig) => __awaiter(void 0, void 0, void 0, function* () {
        const androidManifest = modConfig.modResults;
        const mainApplication = getMainApplicationOrThrow(androidManifest);
        addMetaDataItemToMainApplication(mainApplication, 'com.google.android.geo.API_KEY', apiKey);
        return modConfig;
    }));
};
exports.default = ((config, props) => (0, config_plugins_1.withPlugins)(config, [
    [withGoogleMapsIOS, props],
    [withGoogleMapsAndroid, props],
]));
