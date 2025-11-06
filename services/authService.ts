'use server';
export const login = async (email: string, password: string) => {
    const response = await fetch(process.env.API_URL + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.status == 401) {
        return {
            ok: false,
            msg: "Revise sus credenciales y vuelva a intentarlo.",
            token: null,
        };
    }

    return {
        ok: true,
        token: data.message.login.token,
        msg: "Inicio de sesión exitoso.",
    };
}   