import { useRef, useCallback, useInsertionEffect } from 'react';

// Polyfill until this arrives in React stable

export function useEffectEvent(fn: any) {
	const ref = useRef(null);
	useInsertionEffect(() => {
		ref.current = fn;
	  }, [fn]);

	return useCallback((...args : any[]) => {
		const fn = ref.current;
		return (fn as any)(...args);
	}, []);
}

