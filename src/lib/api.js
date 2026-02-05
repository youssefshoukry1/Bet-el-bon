import axios from 'axios'

const api = axios.create({
    baseURL: 'https://bet-el-bon-api.vercel.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// ================= DRINKS =================
export const fetchDrinks = async () => {
    const res = await api.get('/drink/all')
    return res.data
}

export const createDrink = async (data) => {
    const res = await api.post('/drink/create', data)
    return res.data
}

export const updateDrink = async (id, data) => {
    const res = await api.put(`/drink/${id}`, data)
    return res.data
}

export const deleteDrink = async (id) => {
    const res = await api.delete(`/drink/${id}`)
    return res.data
}

// ================= ORDERS =================
export const createOrder = async (data) => {
    const res = await api.post('/order/create', data)
    return res.data
}

export const fetchOrders = async () => {
    const res = await api.get('/order/getAll')
    return res.data
}

export const fetchOrderById = async (id) => {
    const res = await api.get(`/order/${id}`)
    return res.data
}

export const updateOrderStatus = async ({ id, status, paymentStatus }) => {
    const res = await api.put(`/order/${id}`, { status, paymentStatus })
    return res.data
}

export default api
