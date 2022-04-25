import { isObject, toRawType } from '@vue/shared'
import {
    mutableHandlers,
    readonlyHandlers,
    shallowReactiveHandlers,
    shallowReadonlyHandlers
} from './baseHandlers'



export function reactive(target: any) {
    return createReactiveObject(target, false, mutableHandlers)
}

export function shallowReactive(target: any) {
    return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target: any) {
    return createReactiveObject(target, true, readonlyHandlers)
}

export function shallowReadonly(target: any) {
    return createReactiveObject(target, true, shallowReadonlyHandlers)
}

/**
 *
 * @param target 代理对象
 * @param isReadonly 是否只读
 * @param baseHandler 针对不同方式创建不同的代理对象
 */
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
function createReactiveObject(target: any, isReadonly: boolean, baseHandler: object) {
    if (!isObject(target)) {
        return target
    }

    const proxyMap = isReadonly ? readonlyMap : reactiveMap
    const existingProxy = proxyMap.get(target)
    if (existingProxy) {
        return existingProxy
    }

    const targetType = getTargetType(target)
    if (targetType === 0) {
        return target
    }

    const proxy = new Proxy(target, baseHandler)
    proxyMap.set(target, proxy)

    return proxy
}

function targetTypeMap(rawType: string) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return 1 /* COMMON */;
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return 2 /* COLLECTION */;
        default:
            return 0 /* INVALID */;
    }
}
function getTargetType(value: any) {
    return value["__v_skip" /* SKIP */] || !Object.isExtensible(value)
        ? 0 /* INVALID */
        : targetTypeMap(toRawType(value));
}