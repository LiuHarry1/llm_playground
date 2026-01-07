好，我给你一个**完整、可落地的系统时序图**，严格对应你现在讨论的 **V93000 / RAG / Intent / 校验 / 代码生成** 这套架构。

我会分三层来画，**从“工程师视角”到“系统内部真实发生的事情”**，而且每一步都标清 **是谁在做（LLM / 系统 / 规则）**。

---

# 一、完整系统时序图（核心版）

> 👤 工程师只看到「输入一句话 → 拿到 C++ TP」
> ⚙️ 中间所有步骤都是系统内部

```text
┌──────────┐
│ Engineer │
└────┬─────┘
     │ 1. 自然语言需求
     │    “帮我写一个 core 1.2V 的 IDDQ 测试”
     ▼
┌────────────────┐
│  Orchestrator  │  （系统入口）
└────┬───────────┘
     │
     │ 2. 文档检索请求
     ▼
┌────────────────┐
│   RAG Retriever│
└────┬───────────┘
     │  返回：
     │  - IDDQ guideline
     │  - DCMeasurement 示例
     │  - 公司规范
     ▼
┌────────────────┐
│      LLM       │
│ (Intent Mode)  │
└────┬───────────┘
     │ 3. 抽象 Test Intent（结构化）
     │   ❗不生成代码
     ▼
┌────────────────────────┐
│  Test Intent (JSON)    │
└────┬───────────────────┘
     │
     │ 4. Schema 校验
     ▼
┌────────────────┐
│ Schema Validator│
└────┬───────────┘
     │ OK
     ▼
┌────────────────┐
│ Rule Validator  │
│ (业务规则)     │
└────┬───────────┘
     │
     │ 5. 规则校验
     │   - IDDQ 禁止 multi-site
     │   - 必须 DCVI
     ▼
┌────────────────┐
│ Auto Filler     │
│ (默认补全)     │
└────┬───────────┘
     │
     │ 6. 补全隐含规则
     │   - isolation pattern
     │   - level set
     ▼
┌────────────────────────┐
│ Validated Intent       │
└────┬───────────────────┘
     │
     │ 7. Intent → Template 映射
     ▼
┌────────────────┐
│ Code Generator  │
│ (C++ Template) │
└────┬───────────┘
     │
     │ 8. 生成 V93000 C++
     ▼
┌────────────────────────┐
│ Final Test Program     │
│ (C++ / SmarTest)       │
└──────────┬─────────────┘
           │
           │ 9. 返回给工程师
           ▼
      👤 工程师复制 / 使用
```

---

# 二、同一张图，用「责任边界」再解释一遍（非常重要）

### 🔵 LLM 只负责两件事

```text
- 理解自然语言
- 抽象 Test Intent
```

👉 **LLM 不负责正确性**

---

### 🟢 系统负责所有“工程正确性”

```text
- 规则是否违反
- 默认值是什么
- 怎么写才符合公司规范
```

👉 **系统可控、可测试、可审计**

---

# 三、把 Step 3 和 Step 4 单独“放大”看（你问的重点）

## 🔍 Step 3：抽象 Test Intent（LLM）

```text
User Text
   ↓
LLM（Intent Prompt）
   ↓
{
  "test_type": "IDDQ",
  "voltage_domain": "CORE_1P2V",
  "pins": ["VDD_CORE"],
  "limit_uA": "UNKNOWN",
  "multi_site": false
}
```

特点：

* ❌ 不写代码
* ❌ 不判断对错
* ✅ 只做“表达结构化”

---

## 🔍 Step 4：校验 + 补全（系统）

```text
Intent JSON
   ↓
Schema Check     → 类型 / 字段
   ↓
Rule Check       → 业务规则
   ↓
Auto Fill        → 默认经验
   ↓
Validated Intent
```

---

# 四、一个「真实失败分支」时序（非常关键）

比如工程师说：

> “帮我写一个 multi-site IDDQ 测试”

```text
LLM → Intent
{
  "test_type": "IDDQ",
  "multi_site": true
}

Rule Validator
   ↓
❌ Error:
IDDQ does not support multi-site due to DCVI limitation
```

### 系统行为（推荐）

* ❌ 不生成 C++
* ✅ 把错误直接返回工程师
* ✅ 错误是“规则解释”，不是 LLM 编的

---

# 五、为什么这个时序图在组织里“站得住脚”

你可以直接这么对同事 / 领导说：

> * LLM 是**语言层**
> * Intent 是**语义层**
> * 校验规则是**工程层**
> * C++ 是**执行层**

**每一层职责清晰、可替换、可演进**

---

# 六、最小落地版本（你今天就能开始）

```text
RAG
 + Intent Prompt
 + JSON Schema
 + 10 条规则
 + 1 个 C++ 模板
```

👉 已经可以让工程师真实使用

---

## 最后一段（经验之谈）

> **所有“直接让 LLM 写 V93000 代码”的系统，
> 最终都会“偷偷长成”你现在设计的这个时序图。**

区别只是：

* 是不是一开始就设计清楚
* 出问题时能不能解释得清楚

如果你愿意，下一步我可以：

* 把这张时序图改成 **Mermaid / PlantUML**
* 或直接帮你拆成 **后端模块划分**
* 或把 **规则校验模块写成伪代码**

你想继续哪一个？
