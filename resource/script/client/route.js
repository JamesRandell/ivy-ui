export function route(url) {
    const routes = {
        '/work': [
            { url: '/api/ocr' },
            { url: '/api/angel/personal/calendar', key: 'calendar' }
        ]
    };
    return routes[url];
}
