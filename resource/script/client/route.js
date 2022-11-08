export function route(url) {
    const routes = {
        '/work': ['/api/ocr']
    };
    return routes[url];
}
