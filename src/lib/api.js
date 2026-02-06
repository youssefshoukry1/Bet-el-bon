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

// ================= ORDERS =================// Orders
export const createOrder = async (orderData) => {
    const { data } = await api.post('/order/create', orderData)
    return data
}

export const fetchOrders = async (params) => {
    // accept string or object
    const query = typeof params === 'string' ? `?institutionId=${params}` : ''
    const { data } = await api.get(`/order/getAll${query}`)
    return data
}

export const fetchOrderById = async (id) => {
    const { data } = await api.get(`/order/${id}`)
    return data
}

export const updateOrderStatus = async ({ id, status }) => {
    const { data } = await api.put(`/order/${id}`, { status })
    return data
}

// Institutions
export const fetchInstitutions = async () => {
    const { data } = await api.get('/institution/all')
    return data
}

export const createInstitution = async (instData) => {
    const { data } = await api.post('/institution/create', instData)
    return data
}

export const deleteInstitution = async (id) => {
    const { data } = await api.delete(`/institution/${id}`)
    return data
}

export default api
