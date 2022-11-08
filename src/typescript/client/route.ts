export function route(url: string) {

    const routes: Object = {
        '/work': ['/api/ocr']
    };

    return routes[url]
}