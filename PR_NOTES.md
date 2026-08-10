# PR Notes: Map moves to MapLibre and gets its own tab

## What changed

We swapped out Leaflet for MapLibre as the mapping library behind the Map component. Functionally
it works the same as before, but MapLibre is more actively maintained and gives us more control
over how things look.

The bigger change: the map used to take over the whole canvas, replacing the image. Now it lives
in its own "Map" tab in the Information Panel, right alongside "About" and "Annotations." The
image stays visible the whole time, and the map is just a click away.

We also took the opportunity to give the map a proper design pass so it feels like it belongs in
Clover rather than a bolted-on widget:

- The zoom in/out buttons now match the ones on the image viewer — same shape, color, and icons.
- Markers are a single solid color (the app's accent blue) instead of letting anyone pick an
  arbitrary color, so the map stays visually consistent with the rest of the app. GCP markers
  (used for georeferencing) keep their own orange since they mean something different.
- The popup that shows up when you click a marker got a full style refresh — cleaner typography,
  consistent colors, a much lighter shadow, and no more all-caps labels.
- Popup titles no longer link anywhere by default. They used to jump to a "homepage" URL, which
  wasn't always what people wanted — clicking through will come back later as something you can
  turn on explicitly.
- Fixed a small bug where MapLibre's own default font was leaking into our popups.
- Added a little breathing room around the map inside its tab so it doesn't touch the edges.

## Heads up

One breaking change: the `color` option on custom map markers is gone. Markers always use the
app's accent color now, so if you were setting custom marker colors, that will stop working.
Everything else should feel the same or better.
