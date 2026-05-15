# Chessellation

Fill the plane in a spiral pattern following kernel-based rules.

Inspired by Red & Black Knights: https://www.youtube.com/watch?v=UiX4CFIiegM

## Developing

Start the development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

In a separate terminal, start the rust watcher to get hot reloads for rust changes:

```sh
npm run wasm:dev
```

## Building

To create a production version of the app:

```sh
npm run wasm:build
npm run build
```

You can preview the production build with `npm run preview`.
