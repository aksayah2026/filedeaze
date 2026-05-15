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
const withReactNativeFirebaseIOS = (conf) => {
    return (0, config_plugins_1.withDangerousMod)(conf, [
        'ios',
        (config) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, utils_1.mergeContentsAndSaveAsync)(path_1.default.join(config.modRequest.platformProjectRoot, 'Podfile'), {
                tag: 'firebase-as-static-framework',
                newSrc: [
                    `  $RNFirebaseAsStaticFramework = true`,
                    `  pod 'Firebase', :modular_headers => true`,
                    `  pod 'FirebaseCore', :modular_headers => true`,
                    `  pod 'FirebaseCoreInternal', :modular_headers => true`,
                    `  pod 'GoogleUtilities', :modular_headers => true`,
                ].join('\n'),
                anchor: /use_native_modules/,
                offset: 1,
                comment: '  #',
            });
            yield (0, utils_1.mergeContentsAndSaveAsync)(path_1.default.join(config.modRequest.platformProjectRoot, config.modRequest.projectName, 'AppDelegate.mm'), {
                tag: `firebase-ios-import`,
                newSrc: '#import <Firebase.h>',
                anchor: '#import "AppDelegate.h"',
                offset: 1,
                comment: '//',
            });
            yield (0, utils_1.mergeContentsAndSaveAsync)(path_1.default.join(config.modRequest.platformProjectRoot, config.modRequest.projectName, 'AppDelegate.mm'), {
                tag: `firebase-ios-configure`,
                newSrc: '  [FIRApp configure];',
                anchor: /- \(BOOL\)application:.*application didFinishLaunchingWithOptions/,
                offset: 2,
                comment: '  //',
            });
            return config;
        }),
    ]);
};
/*
const withReactNativeFirebaseAndroid: ConfigPlugin = (conf) => {
    return withDangerousMod(conf, [
        'android',
        async (config) => {
            await mergeContentsAndSaveAsync(
                path.join(
                    config.modRequest.platformProjectRoot,
                    'build.gradle',
                ),
                {
                    tag: `firebase-google-services-dependency`,
                    newSrc: [
                        `        classpath('com.google.gms:google-services:4.3.15')`,
                    ].join('\n'),
                    anchor: 'dependencies {',
                    offset: 1,
                    comment: '        //',
                },
            )

            await mergeContentsAndSaveAsync(
                path.join(
                    config.modRequest.platformProjectRoot,
                    'app/build.gradle',
                ),
                {
                    tag: `firebase-google-services-dependency`,
                    newSrc: [
                        `apply plugin: 'com.google.gms.google-services'`,
                    ].join('\n'),
                    anchor: `apply plugin: "com.android.application"`,
                    offset: 1,
                    comment: '//',
                },
            )

            return config
        },
    ])
}
*/
exports.default = ((config) => (0, config_plugins_1.withPlugins)(config, [
    withReactNativeFirebaseIOS /* withReactNativeFirebaseAndroid */,
]));
