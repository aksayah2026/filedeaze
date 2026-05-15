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
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const { getMainApplicationOrThrow } = config_plugins_1.AndroidConfig.Manifest;
const withUsesCleartextTraffic = (config) => {
    return (0, config_plugins_1.withAndroidManifest)(config, (modConfig) => __awaiter(void 0, void 0, void 0, function* () {
        const androidManifest = modConfig.modResults;
        const mainApplication = getMainApplicationOrThrow(androidManifest);
        mainApplication.$['android:usesCleartextTraffic'] = 'true';
        return modConfig;
    }));
};
exports.default = withUsesCleartextTraffic;
