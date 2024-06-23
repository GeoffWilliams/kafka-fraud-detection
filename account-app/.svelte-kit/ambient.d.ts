
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const COLORTERM: string;
	export const PYENV_SHELL: string;
	export const NVM_INC: string;
	export const WSL2_GUI_APPS_ENABLED: string;
	export const TERM_PROGRAM_VERSION: string;
	export const WSL_DISTRO_NAME: string;
	export const NODE: string;
	export const MAKE_TERMOUT: string;
	export const AWS_PROFILE: string;
	export const CODE_ARTIFACT_AWS_ACCOUNT_ID: string;
	export const npm_config_local_prefix: string;
	export const GPG_TTY: string;
	export const AWS_REGION: string;
	export const PYENV_VERSION: string;
	export const NAME: string;
	export const PWD: string;
	export const PYENV_VIRTUALENV_INIT: string;
	export const LOGNAME: string;
	export const _: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const MAVEN_VERSION: string;
	export const CODE_ARTIFACT_AWS_ROLE: string;
	export const MOTD_SHOWN: string;
	export const COURSIER_CREDENTIALS: string;
	export const HOME: string;
	export const LANG: string;
	export const WSL_INTEROP: string;
	export const LS_COLORS: string;
	export const npm_package_version: string;
	export const WAYLAND_DISPLAY: string;
	export const DENO_INSTALL: string;
	export const CODE_ARTIFACT_USE_NONPROD: string;
	export const GIT_ASKPASS: string;
	export const M2_HOME: string;
	export const CODE_ARTIFACT_ENABLE_BAZEL: string;
	export const MFLAGS: string;
	export const NVM_DIR: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const LESSCLOSE: string;
	export const MAKEFLAGS: string;
	export const TERM: string;
	export const npm_package_name: string;
	export const LESSOPEN: string;
	export const USER: string;
	export const CODE_ARTIFACT_AWS_DOMAIN: string;
	export const MAKE_TERMERR: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const NVM_CD_FLAGS: string;
	export const CONFLUENT_CLOUD_API_KEY: string;
	export const MAKELEVEL: string;
	export const npm_config_user_agent: string;
	export const npm_execpath: string;
	export const XDG_RUNTIME_DIR: string;
	export const PYENV_ROOT: string;
	export const npm_package_json: string;
	export const WSLENV: string;
	export const BUN_INSTALL: string;
	export const CONFLUENT_CLOUD_API_SECRET: string;
	export const CODE_ARTIFACT_AWS_PROFILE: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const XDG_DATA_DIRS: string;
	export const VAGRANT_WSL_ENABLE_WINDOWS_ACCESS: string;
	export const PATH: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const NVM_BIN: string;
	export const HOSTTYPE: string;
	export const PULSE_SERVER: string;
	export const npm_node_execpath: string;
	export const OLDPWD: string;
	export const TERM_PROGRAM: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		COLORTERM: string;
		PYENV_SHELL: string;
		NVM_INC: string;
		WSL2_GUI_APPS_ENABLED: string;
		TERM_PROGRAM_VERSION: string;
		WSL_DISTRO_NAME: string;
		NODE: string;
		MAKE_TERMOUT: string;
		AWS_PROFILE: string;
		CODE_ARTIFACT_AWS_ACCOUNT_ID: string;
		npm_config_local_prefix: string;
		GPG_TTY: string;
		AWS_REGION: string;
		PYENV_VERSION: string;
		NAME: string;
		PWD: string;
		PYENV_VIRTUALENV_INIT: string;
		LOGNAME: string;
		_: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		MAVEN_VERSION: string;
		CODE_ARTIFACT_AWS_ROLE: string;
		MOTD_SHOWN: string;
		COURSIER_CREDENTIALS: string;
		HOME: string;
		LANG: string;
		WSL_INTEROP: string;
		LS_COLORS: string;
		npm_package_version: string;
		WAYLAND_DISPLAY: string;
		DENO_INSTALL: string;
		CODE_ARTIFACT_USE_NONPROD: string;
		GIT_ASKPASS: string;
		M2_HOME: string;
		CODE_ARTIFACT_ENABLE_BAZEL: string;
		MFLAGS: string;
		NVM_DIR: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		LESSCLOSE: string;
		MAKEFLAGS: string;
		TERM: string;
		npm_package_name: string;
		LESSOPEN: string;
		USER: string;
		CODE_ARTIFACT_AWS_DOMAIN: string;
		MAKE_TERMERR: string;
		VSCODE_GIT_IPC_HANDLE: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		NVM_CD_FLAGS: string;
		CONFLUENT_CLOUD_API_KEY: string;
		MAKELEVEL: string;
		npm_config_user_agent: string;
		npm_execpath: string;
		XDG_RUNTIME_DIR: string;
		PYENV_ROOT: string;
		npm_package_json: string;
		WSLENV: string;
		BUN_INSTALL: string;
		CONFLUENT_CLOUD_API_SECRET: string;
		CODE_ARTIFACT_AWS_PROFILE: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		XDG_DATA_DIRS: string;
		VAGRANT_WSL_ENABLE_WINDOWS_ACCESS: string;
		PATH: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		NVM_BIN: string;
		HOSTTYPE: string;
		PULSE_SERVER: string;
		npm_node_execpath: string;
		OLDPWD: string;
		TERM_PROGRAM: string;
		VSCODE_IPC_HOOK_CLI: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
