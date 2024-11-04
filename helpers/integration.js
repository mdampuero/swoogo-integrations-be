
const integrationQuery = (req) => {
    const { offset = '0', limit = '30', sort = 'type', direction = 'DESC', search = '', filter } = req.query;

    // Parsear los filtros si están presentes
    const filters = filter ? JSON.parse(decodeURIComponent(filter)) : null;

    // Construir el objeto `query` con el filtro de búsqueda y los filtros adicionales
    const query = {
        isDelete: false,
        ['event.name']: { $regex: '.*' + search + '.*', $options: 'i' },
        ...(filters && {
            ...(filters.type && { type: filters.type }),
            ...(filters.isActive && { isActive: filters.isActive })
        })
    };

    return {
        offset: Number(offset),
        direction,
        limit: Number(limit),
        query,
        sort
    };
};

module.exports = {
    integrationQuery
}