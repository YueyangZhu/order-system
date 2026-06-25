-- 在 Supabase SQL 编辑器中执行以下 SQL 来创建 orders 表
-- 打开 Supabase 项目 → SQL Editor → 粘贴执行

-- 创建 orders 表
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 开启行级安全策略（RLS）
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 用户只能操作自己的订单
CREATE POLICY "用户只能查看自己的订单"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能新增自己的订单"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能修改自己的订单"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的订单"
  ON public.orders FOR DELETE
  USING (auth.uid() = user_id);

-- 插入测试数据（可选，用于验证）
-- INSERT INTO public.orders (customer_name, product_name, quantity, unit_price, total_amount, status, user_id)
-- VALUES ('测试客户', '测试产品', 2, 99.99, 199.98, 'pending', (SELECT id FROM auth.users LIMIT 1));
