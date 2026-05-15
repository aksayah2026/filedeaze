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
exports.mergeContentsAndSaveAsync = void 0;
const fs_1 = __importDefault(require("fs"));
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
function readFileAsync(path) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fs_1.default.promises.readFile(path, 'utf8');
    });
}
function saveFileAsync(path, content) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_1.default.promises.writeFile(path, content, 'utf8');
    });
}
function mergeContentsAndSaveAsync(path, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { contents, didMerge } = (0, generateCode_1.mergeContents)(Object.assign(Object.assign({}, options), { src: yield readFileAsync(path) }));
        if (didMerge) {
            yield saveFileAsync(path, contents);
        }
    });
}
exports.mergeContentsAndSaveAsync = mergeContentsAndSaveAsync;
