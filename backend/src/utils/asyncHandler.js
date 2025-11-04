/**
 * Wrapper para funções assíncronas que captura erros automaticamente
 * @param {Function} fn - Função assíncrona
 * @returns {Function} - Função que retorna uma Promise
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

