# Write Tests

## Overview
编写全面的单元测试和集成测试，确保代码质量和功能正确性。

## Python/FastAPI 后端测试

### 测试框架
- 使用 `pytest` 作为测试框架
- 使用 `pytest-asyncio` 测试异步代码
- 使用 `pytest-mock` 进行 mock

### 测试结构
- 测试文件命名：`test_*.py` 或 `*_test.py`
- 测试函数命名：`test_<功能描述>`
- 测试类命名：`Test<类名>`

### 测试覆盖
- [ ] 测试正常流程（happy path）
- [ ] 测试边界条件
- [ ] 测试错误情况（异常处理）
- [ ] 测试输入验证
- [ ] 测试异步函数
- [ ] Mock 外部依赖（数据库、API 调用等）

### 示例结构
```python
import pytest
from unittest.mock import Mock, patch

@pytest.mark.asyncio
async def test_function_name():
    # Arrange - 准备测试数据
    input_data = {...}
    
    # Act - 执行被测试的函数
    result = await function_under_test(input_data)
    
    # Assert - 验证结果
    assert result == expected_value
```

### FastAPI 测试
- [ ] 使用 `TestClient` 测试 API 端点
- [ ] 测试不同的 HTTP 方法（GET, POST, PUT, DELETE）
- [ ] 测试请求验证（Pydantic 模型）
- [ ] 测试响应状态码和内容
- [ ] 测试认证和授权

---

## TypeScript/React 前端测试

### 测试框架
- 使用 `Vitest` 作为测试框架（项目已配置）
- 使用 `@testing-library/react` 测试 React 组件
- 使用 `@testing-library/user-event` 模拟用户交互

### 测试结构
- 测试文件命名：`*.test.ts` 或 `*.test.tsx`
- 测试函数命名：`test('描述', () => {})` 或 `it('描述', () => {})`

### 测试覆盖
- [ ] 测试组件渲染
- [ ] 测试用户交互（点击、输入等）
- [ ] 测试 props 传递
- [ ] 测试状态变化
- [ ] 测试条件渲染
- [ ] 测试错误处理
- [ ] Mock API 调用

### 示例结构
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from './Component';

test('组件应该正确渲染', () => {
  // Arrange
  render(<Component prop="value" />);
  
  // Act
  const element = screen.getByText('expected text');
  
  // Assert
  expect(element).toBeInTheDocument();
});
```

---

## 通用测试原则

### 测试质量
- [ ] 测试独立（不依赖其他测试）
- [ ] 测试可重复（每次运行结果一致）
- [ ] 测试快速（避免慢速操作）
- [ ] 测试清晰（命名和结构易于理解）
- [ ] 测试完整（覆盖主要功能）

### 测试组织
- [ ] 使用 `setup` 和 `teardown` 管理测试环境
- [ ] 使用 fixtures 共享测试数据
- [ ] 使用 describe/it 组织相关测试
- [ ] 避免测试之间的依赖

### Mock 和 Stub
- [ ] Mock 外部服务（API、数据库）
- [ ] Mock 时间相关函数（日期、定时器）
- [ ] 使用真实的测试数据或合理的假数据
- [ ] 验证 mock 被正确调用

### 断言
- [ ] 使用明确的断言消息
- [ ] 测试一个概念（一个测试一个断言）
- [ ] 验证预期的行为，而不是实现细节

---

## 快速检查清单

在编写测试时：
1. ✅ 测试正常情况
2. ✅ 测试错误情况
3. ✅ 测试边界条件
4. ✅ Mock 外部依赖
5. ✅ 测试独立且可重复
6. ✅ 测试命名清晰
7. ✅ 测试运行快速





