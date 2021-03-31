/*
 * interfaceType
 * 普通链接地址
 * 双流-fpms 
 * 天府-api
*/
let interfaceType = "api"
/*
 * socketInterfaceType
 * socket的链接地址
 * 双流-ghms 
 * 天府-fpms
*/
let sysEdition = 'tianfu'
/*
 * coder
 * 登录，修改密码是否加密
 * 加密-true 天府加密
 * 不加密-false,双流不加密
*/
let coder = true

window.webConfig = {
    interfaceType,
    sysEdition,
    coder
}
