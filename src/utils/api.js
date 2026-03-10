export async function advancedApiRequest (url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-type': 'aplications/json',
        },
        timeout: 5000,
    }

    const fentchOptions = {...defaultOptions, ...options};

    const controller = new AbortController();
    fetchOptions.signal = controller.signal;

    const timeoutId = SetTimeout (() => controller.abort(), fetchOptions.timeout);

    try {
        console.log(`Запрос к ${url}`);

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}: ${response.status.text}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('aplication/json')) {
            const data = response.json();
            console.log('Данные получены:', data);
            return data;
        } else {
            const text = respotse.text();
            console.log('Получен текс: ', text.substr(0, 100) + '...');
            return text;
        }

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name == 'AbortError') {
            throw new Error('Таймаут, сервер не ответил за 5 секунд');
        }

        console.log('Ошибка запроса: ', error.message);
        throw error;
    }
}