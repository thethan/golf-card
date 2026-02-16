import osmtogeojson from "osmtogeojson";
import React from "react";

type BBox = { south: number; west: number; north: number; east: number };

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function buildQuery(b: BBox) {
    const bbox = `${b.south},${b.west},${b.north},${b.east}`;
    return `
[out:json][timeout:60];
(
  way["leisure"="golf_course"](${bbox});
  relation["leisure"="golf_course"](${bbox});

  node["golf"="hole"](${bbox});
  way["golf"="hole"](${bbox});
  relation["golf"="hole"](${bbox});

  way["golf"="green"](${bbox});
  relation["golf"="green"](${bbox});
  way["golf"="tee"](${bbox});
  relation["golf"="tee"](${bbox});
  way["golf"="bunker"](${bbox});
  relation["golf"="bunker"](${bbox});

  way["natural"="water"](${bbox});
  relation["natural"="water"](${bbox});
);
out body;
>;
out skel qt;
`.trim();
}

async function overpass(query: string) {
    // Overpass accepts POST with raw query in the body
    const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {"Content-Type": "text/plain;charset=UTF-8"},
        body: query,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Overpass error ${res.status}: ${text.slice(0, 400)}`);
    }

    return res.json();
}

function summarize(geojson: any) {
    const counts = new Map<string, number>();

    for (const f of geojson.features ?? []) {
        const tags = f.properties?.tags ?? {};
        const key =
            tags.golf
                ? `golf=${tags.golf}`
                : tags.leisure
                    ? `leisure=${tags.leisure}`
                    : tags.natural
                        ? `natural=${tags.natural}`
                        : "other";
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1]));
}

async function run() {
    // Example bbox (replace with your course area)
    // Tip: you can grab bbox from openstreetmap.org > "Export" tab.
    const bbox: BBox = {
        south: 33.90,
        west: -118.50,
        north: 34.10,
        east: -118.20,
    };

    const query = buildQuery(bbox);
    const osm = await overpass(query);

    // Convert Overpass JSON -> GeoJSON FeatureCollection
    const geojson = osmtogeojson(osm);

    console.log("Feature counts:", summarize(geojson));
    // If you want the actual GeoJSON:
    // console.log(JSON.stringify(geojson, null, 2));
}

export function CourseMap({}) {

    React.useEffect(() => {
        (async () => {
             await run();

        })();
    }, []);
}
