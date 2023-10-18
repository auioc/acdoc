export interface Config {
    basePath?: string;
    targetElement?: HTMLElement;
}

export function getConfig<T extends keyof Config>(
    config: Config,
    key: T,
    or?: Config[T]
) {
    const v = config[key];
    if (v === undefined) {
        return or;
    }
    return v;
}
