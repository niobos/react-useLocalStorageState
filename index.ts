/* Inspired by https://medium.com/swlh/using-react-hooks-to-sync-your-component-state-with-the-url-query-string-81ccdfcb174f
 */

import {useCallback, useState} from 'react';

export function jsonParserWithDefault<T>(defaultValue: T): (value: string|null) => T {
    return (valueFromHash) => {
        if(valueFromHash == null) {
            return defaultValue;
        } // else:
        try {
            return JSON.parse(valueFromHash);
        } catch(e) {
            return defaultValue;
        }
    }
}

export default function useLocalStorageState<T>(
    key: string,
    fromString: ((value: string) => T) | T,
    toString?: (value: T) => string,
): [T, (value: T) => void] {
    /* similar to useState() hook, but stores the state in Local Storage as well.
     * Note that Local Storage is scoped on the entire domain (Origin), so be careful
     * with the key you supply.
     *
     * The optional functions `fromString` and `toString` can be supplied
     * to customize the conversion from/to the string stored in the URL-hash.
     * By default it output/parses JSON.
     *
     * if `fromString` is not a function, it's considered a default value.
     */
    if(!(fromString instanceof Function)) {  // defaultValue or undefined
        const defaultValue = fromString;
        fromString = jsonParserWithDefault<T>(defaultValue)
    }

    if(toString == null) {
        toString = JSON.stringify
    }

    const [value, setValue] = useState<T>(fromString(window.localStorage.getItem(key)))

    const onSetValue = useCallback(  // Re-use same callback for same key
        newValue => {
            setValue(newValue)
            window.localStorage.setItem(key, toString(newValue))
        },
        [key]
    )

    return [value, onSetValue]
}
