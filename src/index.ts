import { App } from 'vue';
import vueDragLevel from './components/index.vue';

const components = [vueDragLevel];
const install = (app: App) => {
    components.map(item => {
      app.component(item.name, item)
    })
}
//实现按需引入
export { vueDragLevel } 

export default install // 批量的引入