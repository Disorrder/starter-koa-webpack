export function requireAll(requireContext) {  // auto require from project
    if (!requireContext) requireContext = require.context('./', true, /\.js$/)
    let exclude = ['/__'];
    let modules = requireContext.keys();

    return _(modules)
        .filter((v) => {
            return !_.some(exclude, (x) => ~v.indexOf('/__'));
        })
        .map((v) => requireContext(v))
        .value()
    ;
}
