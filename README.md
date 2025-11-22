

## Progress — Setup steps (summary)

The following lists the steps provided and the current status (up to now) based on the repository contents.

1. Initialized an empty turborepo
	- Status: Done — `turbo.json` and workspace layout present.
2. Deleted the docs app
	- Status: Done — `apps/docs` is not present in this workspace.
3. Added http-server, ws-server
	- Status: Done — `apps/http-backend` and `apps/ws-backend` exist.
4. Added `package.json` in both places
	- Status: Done — see `apps/http-backend/package.json` and `apps/ws-backend/package.json`.
5. Added `tsconfig.json` in both the places, and imported it from `@repo/typescript-config/base.json`
	- Status: Done — `packages/typescript-config` is present and apps reference workspace configs.
6. Added `@repo/typescript-config` as a dependency in both ws-server and http-server
	- Status: Done — `apps/http-backend/package.json` lists `@repo/typescript-config` as `workspace:*`.
7. Added `build`, `dev` and `start` scripts to both the projects
	- Status: Present — see `scripts` in each app's `package.json`.
8. Update the turbo-config in both the projects (optional)
	- Status: Optional — local `turbo.json` is present; filtering/scripts can be adjusted as needed.
9. Initialize a http server, Initialize a websocket server
	- Status: HTTP server implemented (`apps/http-backend/src/index.ts`). WebSocket server scaffold exists at `apps/ws-backend` (verify/extend as needed).

10. Create an express server, add signup, signin, create-room
	 - Status: Done — `apps/http-backend/src/index.ts` implements routes: `/`, `/signin`, `/signup`, `/room`.
11. Create middleware, gate the create-room point
	 - Status: Done — `apps/http-backend/src/middleware.ts` verifies JWT and attaches `userId`.
12. Gate the websocket server using the token
	 - Status: Partial — websocket gating planned; HTTP auth/middleware is implemented and can be reused for WS.

13. Create a db package
	 - Status: Created (in progress) — `packages/db` exists, implementation needs completion.
14. Using the db package in the http layer
	 - Status: Planned/partial — HTTP endpoints have DB TODOs; wire `packages/db` into `apps/http-backend` next.
15. Add a common package where we add the zod schema and the JWT_SECRET
	 - Status: Done — zod schemas in `packages/types/src/index.ts`; JWT_SECRET in `packages/config/src/index.ts`.
