export function route(url: string) {

    const routes: Object = {
        '/work': [
                    '/api/ocr',
                    '/api/angel/personal/calendar'
                ]
    };

    return routes[url]
}