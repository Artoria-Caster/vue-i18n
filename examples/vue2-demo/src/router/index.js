import i18n from '../i18n/index';
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
{
  path: '/',
  name: 'Home',
  component: () => import('../views/Home.vue'),
  meta: {
    title: '首页'
  }
},
{
  path: '/user',
  name: 'User',
  component: () => import('../views/User.vue'),
  meta: {
    title: '用户管理'
  }
},
{
  path: '/product',
  name: 'Product',
  component: () => import('../views/Product.vue'),
  meta: {
    title: '商品管理'
  }
},
{
  path: '/order',
  name: 'Order',
  component: () => import('../views/Order.vue'),
  meta: {
    title: '订单管理'
  }
},
{
  path: '/settings',
  name: 'Settings',
  component: () => import('../views/Settings.vue'),
  meta: {
    title: '系统设置'
  }
},
{
  path: '/login',
  name: 'Login',
  component: () => import('../views/Login.vue'),
  meta: {
    title: '用户登录'
  }
},
{
  path: '*',
  redirect: '/'
}];


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = i18n.t('common.textc8hokr', { title: to.meta.title });
  }

  // 检查是否需要登录
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) {
    console.warn(i18n.t('common.textxtyefv'));
    // next('/login');
    // 暂时注释掉登录验证，方便测试
  }

  console.log(`路由跳转：从 ${from.path} 到 ${to.path}`);
  next();
});

// 全局后置钩子
router.afterEach((to) => {
  console.log(`页面切换完成：${to.path}`);
});

export default router;