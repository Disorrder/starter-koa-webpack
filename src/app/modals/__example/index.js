import './modal.styl'
module.exports = {
    backdropClass: 'blurred',
    controller: require('./modal.controller.js'),
    controllerAs: 'modal',
    template: require('./modal.pug')
}
