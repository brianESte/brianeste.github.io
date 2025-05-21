# River Tours page

Intended to be a helpful resource when planning a tour of the Lahn river.

## River Map
The map is edited in Inkscape and stored as an "optimized SVG". I have not found a consistent/successful way to preserve IDs ending in a number when "optimizing" the SVG. As a workaround, IDs ending in a number that I wish to keep are appended with a '_'.

## Testing
After a frustrating hour, I discovered (thanks to [this answer](https://stackoverflow.com/a/53715808)) that `document.getElementById().contentDocument` does not work properly if the website is opened locally on a browser (ie: open -> index.html). When the website is served by an actual server, `.contentDocument` works as intended. Current testing workflow is to simply run a basic Python http server from the root directory:
```
$ cd river_tours/
$ python -m http.server <port number>
```
The default port number is 8000.