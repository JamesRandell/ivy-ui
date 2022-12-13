export function route(url) {
    const routes = {
        '/work': [
            '/api/ocr',
            '/api/angel/personal/calendar'
        ]
    };
    return routes[url];
}
