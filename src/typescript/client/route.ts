export function route(url: string) {

    const routes: Object = {
        '/work': [
                    {url:'/api/ocr'},
                    {url:'/api/angel/personal/calendar',key:'calendar'}
                ]
    };

    return routes[url]
}