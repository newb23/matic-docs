---
id: u32_operations
title: u32 Operations 
sidebar_label: u32 Operations
description: "Instructions for operations on 32-bit integers."
keywords:
  - docs
  - matic
  - polygon
  - miden
  - u32
image: https://wiki.polygon.technology/img/thumbnail/polygon-miden.png
---

Miden assembly provides a set of instructions which can perform operations on regular two-complement 32-bit integers. These instructions are described in the tables below.

Most instructions have _checked_ variants. These variants ensure that input values are 32-bit integers, and fail if that's not the case. All other variants do not perform these checks, and thus, should be used only if the inputs are known to be 32-bit integers. Supplying inputs which are greater than or equal to $2^{32}$ to unchecked operations results in undefined behavior.

The primary benefit of using unchecked operations is performance: they can frequently be executed $2$ or $3$ times faster than their checked counterparts. In general, vast majority of the unchecked operations listed below can be executed in a single VM cycle.

For instructions where one or more operands can be provided as immediate parameters (e.g., `u32checked_add` and `u32checked_add.b`), we provide stack transition diagrams only for the non-immediate version. For the immediate version, it can be assumed that the operand with the specified name is not present on the stack.

In all the table below, the number of cycles it takes for the VM to execute each instruction is listed beneath the instruction.

### Conversions and tests

| Instruction                         | Stack input | Stack output  | Notes                                      |
| ----------------------------------- | ----------- | ------------- | ------------------------------------------ |
| u32test <br></br> - *(5 cycles)*         | [a, ...]    | [b, a, ...]   | $b \leftarrow \begin{cases} 1, & \text{if}\ a < 2^{32} \\ 0, & \text{otherwise}\ \end{cases}$ |
| u32testw <br></br> - *(23 cycles)*       | [A, ...]    | [b, A, ...]   | $b \leftarrow \begin{cases} 1, & \text{if}\ \forall\ i \in \{0, 1, 2, 3\}\ a_i < 2^{32} \\ 0, & \text{otherwise}\ \end{cases}$ |
| u32assert <br></br> u32assert.1 <br></br> - *(3 cycles)* | [a, ...]    | [a, ...]  | Fails if $a \ge 2^{32}$ |
| u32assert.2 <br></br> - *(1 cycle)*     | [b, a,...]  | [b, a,...] | Fails if $a \ge 2^{32}$ or $b \ge 2^{32}$ |
| u32assertw <br></br> - *(6 cycles)*      | [A, ...]    | [A, ...]      | Fails if $\exists\ i \in \{0, 1, 2, 3\} \ni a_i \ge 2^{32}$ |
| u32cast <br></br> - *(2 cycles)*         | [a, ...]    | [b, ...]      | $b \leftarrow a \mod 2^{32}$ |
| u32split <br></br> - *(1 cycle)*        | [a, ...]    | [c, b, ...]   | $b \leftarrow a \mod 2^{32}$, $c \leftarrow \lfloor{a / 2^{32}}\rfloor$ |


### Arithmetic operations

| Instruction                                  | Stack input    | Stack output  | Notes                                      |
| -------------------------------------------- | -------------- | ------------- | ------------------------------------------ |
| u32checked_add <br></br> - *(4 cycles)* <br></br> u32checked_add.*b* <br></br> - *(5-6 cycles)*     | [b, a, ...] | [c, ...] | $c \leftarrow a + b$ <br></br> Fails if $max(a, b, c) \ge 2^{32}$ |
| u32overflowing_add <br></br> - *(1 cycle)* <br></br> u32overflowing_add.*b* <br></br> - *(2-3 cycles)*    | [b, a, ...] | [d, c, ...] | $c \leftarrow (a + b) \mod 2^{32}$ <br></br> $d \leftarrow \begin{cases} 1, & \text{if}\ (a + b) \ge 2^{32} \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32wrapping_add <br></br> - *(2 cycles)* <br></br> u32wrapping_add.*b* <br></br> - *(3-4 cycles)*     | [b, a, ...] | [c, ...] |  $c \leftarrow (a + b) \mod 2^{32}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32overflowing_add3 <br></br> - *(1 cycle)* | [c, b, a, ...] | [e, d, ...]   | $d \leftarrow (a + b + c) \mod 2^{32}$, <br></br> $e \leftarrow \lfloor (a + b + c) / 2^{32}\rfloor$ <br></br> Undefined if $max(a, b, c) \ge 2^{32}$ <br></br> |
| u32wrapping_add3 <br></br> - *(2 cycles)* | [c, b, a, ...] | [d, ...]   | $d \leftarrow (a + b + c) \mod 2^{32}$, <br></br> Undefined if $max(a, b, c) \ge 2^{32}$ <br></br> |
| u32checked_sub <br></br> - *(4 cycles)* <br></br> u32checked_sub.*b*  <br></br> - *(5-6 cycles)*      | [b, a, ...] | [c, ...] | $c \leftarrow (a - b)$ <br></br> Fails if $max(a, b) \ge 2^{32}$ or $a < b$ |
| u32overflowing_sub <br></br> - *(1 cycle)* <br></br> u32overflowing_sub.*b* <br></br> - *(2-3 cycles)*    | [b, a, ...] | [d, c, ...] | $c \leftarrow (a - b) \mod 2^{32}$ <br></br> $d \leftarrow \begin{cases} 1, & \text{if}\ a < b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32wrapping_sub <br></br> - *(2 cycles)* <br></br> u32wrapping_sub.*b* <br></br> - *(3-4 cycles)*    | [b, a, ...] | [c, ...] | $c \leftarrow (a - b) \mod 2^{32}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32checked_mul <br></br> - *(4 cycles)* <br></br> u32checked_mul.*b* <br></br> - *(5-6 cycles)*      | [b, a, ...] | [c, ...] | $c \leftarrow a \cdot b$ <br></br> Fails if $max(a, b, c) \ge 2^{32}$ |
| u32overflowing_mul <br></br> - *(1 cycle)* <br></br> u32overflowing_mul.*b* <br></br> - *(2-3 cycles)*   | [b, a, ...] | [d, c, ...] | $c \leftarrow (a \cdot b) \mod 2^{32}$ <br></br> $d \leftarrow \lfloor(a \cdot b) / 2^{32}\rfloor$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32wrapping_mul <br></br> - *(2 cycles)* <br></br> u32wrapping_mul.*b* <br></br> - *(3-4 cycles)*       | [b, a, ...] | [c, ...] | $c \leftarrow (a \cdot b) \mod 2^{32}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32overflowing_madd <br></br> - *(1 cycle)* | [b, a, c, ...] | [e, d, ...] | $d \leftarrow (a \cdot b + c) \mod 2^{32}$ <br></br> $e \leftarrow \lfloor(a \cdot b + c) / 2^{32}\rfloor$ <br></br> Undefined if $max(a, b, c) \ge 2^{32}$ |
| u32wrapping_madd <br></br> - *(2 cycles)* | [b, a, c, ...] | [d, ...] | $d \leftarrow (a \cdot b + c) \mod 2^{32}$ <br></br> Undefined if $max(a, b, c) \ge 2^{32}$ |
| u32checked_div <br></br> - *(3 cycles)* <br></br> u32checked_div.*b* <br></br> - *(4-5 cycles)*    | [b, a, ...] | [c, ...] | $c \leftarrow \lfloor a / b\rfloor$ <br></br> Fails if $max(a, b) \ge 2^{32}$ or $b = 0$ |
| u32unchecked_div <br></br> - *(2 cycles)* <br></br> u32unchecked_div.*b* <br></br> - *(3-4 cycles)*   | [b, a, ...] | [c, ...] | $c \leftarrow \lfloor a / b\rfloor$ <br></br> Fails if $b = 0$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32checked_mod <br></br> - *(4 cycles)* <br></br> u32checked_mod.*b* <br></br> - *(5-6 cycles)*   | [b, a, ...] | [c, ...] | $c \leftarrow a \mod b$ <br></br> Fails if $max(a, b) \ge 2^{32}$ or $b = 0$ |
| u32unchecked_mod <br></br> - *(3 cycles)* <br></br> u32unchecked_mod.*b* <br></br> - *(4-5 cycles)*    | [b, a, ...] | [c, ...] | $c \leftarrow a \mod b$ <br></br> Fails if $b = 0$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32checked_divmod <br></br> - *(2 cycles)* <br></br> u32checked_divmod.*b* <br></br> - *(3-4 cycles)*   | [b, a, ...] | [d, c, ...] | $c \leftarrow \lfloor a / b\rfloor$ <br></br> $d \leftarrow a \mod b$ <br></br> Fails if $max(a, b) \ge 2^{32}$ or $b = 0$ |
| u32unchecked_divmod <br></br> - *(1 cycle)* <br></br> u32unchecked_divmod.*b* <br></br> - *(2-3 cycles)*    | [b, a, ...] | [d, c, ...] | $c \leftarrow \lfloor a / b\rfloor$ <br></br> $d \leftarrow a \mod b$ <br></br> Fails if $b = 0$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |

### Bitwise operations

| Instruction    | Stack input    | Stack output  | Notes                                      |
| -------------- | -------------- | ------------- | ------------------------------------------ |
| u32checked_and <br></br> - *(1 cycle)*    | [b, a, ...]    | [c, ...]      | Computes $c$ as a bitwise `AND` of binary representations of $a$ and $b$. <br></br> Fails if $max(a,b) \ge 2^{32}$ |
| u32checked_or <br></br> - *(6 cycle)s*    | [b, a, ...]    | [c, ...]      | Computes $c$ as a bitwise `OR` of binary representations of $a$ and $b$. <br></br> Fails if $max(a,b) \ge 2^{32}$ |
| u32checked_xor <br></br> - *(1 cycle)*    | [b, a, ...]    | [c, ...]      | Computes $c$ as a bitwise `XOR` of binary representations of $a$ and $b$. <br></br> Fails if $max(a,b) \ge 2^{32}$ |
| u32checked_not <br></br> - *(5 cycles)*   | [a, ...]       | [b, ...]      | Computes $b$ as a bitwise `NOT` of binary representation of $a$. <br></br> Fails if $a \ge 2^{32}$ |
| u32checked_shl <br></br> - *(47 cycles)* <br></br> u32checked_shl.*b*  <br></br> - *(4 cycles)*       | [b, a, ...] | [c, ...]    | $c \leftarrow (a \cdot 2^b) \mod 2^{32}$ <br></br> Fails if $a \ge 2^{32}$ or $b > 31$ |
| u32unchecked_shl <br></br> - *(40 cycles)* <br></br> u32unchecked_shl.*b* <br></br> - *(3 cycles)*    | [b, a, ...] | [c, ...]    | $c \leftarrow (a \cdot 2^b) \mod 2^{32}$ <br></br> Undefined if $a \ge 2^{32}$ or $b > 31$ |
| u32checked_shr <br></br> - *(47 cycles)*<br></br> u32checked_shr.*b* <br></br> - *(4 cycles)*         | [b, a, ...] | [c, ...] | $c \leftarrow \lfloor a/2^b \rfloor$ <br></br> Fails if $a \ge 2^{32}$ or $b > 31$ |
| u32unchecked_shr <br></br> - *(40 cycles)* <br></br> u32unchecked_shr.*b* <br></br> - *(3 cycles)*    | [b, a, ...] | [c, ...] | $c \leftarrow \lfloor a/2^b \rfloor$ <br></br> Undefined if $a \ge 2^{32}$ or $b > 31$ |
| u32checked_rotl <br></br> - *(47 cycles)* <br></br> u32checked_rotl.*b* <br></br> - *(4 cycles)*      | [b, a, ...] | [c, ...] | Computes $c$ by rotating a 32-bit representation of $a$ to the left by $b$ bits. <br></br> Fails if $a \ge 2^{32}$ or $b > 31$ |
| u32unchecked_rotl <br></br> - *(40 cycles)* <br></br> u32unchecked_rotl.*b* <br></br> - *(3 cycles)*   | [b, a, ...] | [c, ...] | Computes $c$ by rotating a 32-bit representation of $a$ to the left by $b$ bits. <br></br> Undefined if $a \ge 2^{32}$ or $b > 31$ |
| u32checked_rotr <br></br> - *(59 cycles)* <br></br> u32checked_rotr.*b* <br></br> - *(6 cycles)*      | [b, a, ...] | [c, ...] | Computes $c$ by rotating a 32-bit representation of $a$ to the right by $b$ bits. <br></br> Fails if $a \ge 2^{32}$ or $b > 31$ |
| u32unchecked_rotr <br></br> - *(44 cycles)* <br></br> u32unchecked_rotr.*b* <br></br> - *(3 cycles)*   | [b, a, ...] | [c, ...] | Computes $c$ by rotating a 32-bit representation of $a$ to the right by $b$ bits. <br></br> Undefined if $a \ge 2^{32}$ or $b > 31$ |
| u32checked_popcnt <br></br> - *(36 cycles)*   | [a, ...] | [b, ...] | Computes $b$ by counting the number of set bits in $a$ (hamming weight of $a$). <br></br> Fails if $a \ge 2^{32}$ |
| u32unchecked_popcnt <br></br> - *(33 cycles)* | [a, ...] | [b, ...] | Computes $b$ by counting the number of set bits in $a$ (hamming weight of $a$). <br></br> Undefined if $a \ge 2^{32}$ |

### Comparison operations

| Instruction     | Stack input  | Stack output    | Notes                                      |
| --------------- | ------------ | --------------- | ------------------------------------------ |
| u32checked_eq <br></br> - *(2 cycles)* <br></br> u32checked_eq.*b*  <br></br> - *(3-4 cycles)* | [b, a, ...] | [c, ...] | $c \leftarrow \begin{cases} 1, & \text{if}\ a=b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Fails if $max(a, b) \ge 2^{32}$ <br></br> Note: unchecked version is not provided because it is equivalent to simple `eq`. |
| u32checked_neq <br></br> - *(3 cycles)* <br></br> u32checked_neq.*b* <br></br> - *(4-5 cycles)* | [b, a, ...] | [c, ...] | $c \leftarrow \begin{cases} 1, & \text{if}\ a \ne b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Fails if $max(a, b) \ge 2^{32}$ <br></br> Note: unchecked version is not provided because it is equivalent to simple `neq`. |
| u32checked_lt <br></br> - *(6 cycles)*  | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} 1, & \text{if}\ a < b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Fails if $max(a, b) \ge 2^{32}$ |
| u32unchecked_lt <br></br> - *(5 cycles)* | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} 1, & \text{if}\ a < b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32checked_lte <br></br> - *(8 cycles)*  | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} 1, & \text{if}\ a \le b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Fails if $max(a, b) \ge 2^{32}$ |
| u32unchecked_lte <br></br> - *(7 cycles)* | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} 1, & \text{if}\ a \le b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32checked_gt <br></br> - *(7 cycles)*   | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} 1, & \text{if}\ a > b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Fails if $max(a, b) \ge 2^{32}$ |
| u32unchecked_gt <br></br> - *(6 cycles)* | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} 1, & \text{if}\ a > b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32checked_gte <br></br> - *(7 cycles)*  | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} 1, & \text{if}\ a \ge b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Fails if $max(a, b) \ge 2^{32}$ |
| u32unchecked_gte <br></br> - *(6 cycles)* | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} 1, & \text{if}\ a \ge b \\ 0, & \text{otherwise}\ \end{cases}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32checked_min <br></br> - *(9 cycles)*  | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} a, & \text{if}\ a < b \\ b, & \text{otherwise}\ \end{cases}$ <br></br> Fails if $max(a, b) \ge 2^{32}$ |
| u32unchecked_min <br></br> - *(8 cycles)* | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} a, & \text{if}\ a < b \\ b, & \text{otherwise}\ \end{cases}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
| u32checked_max <br></br> - *(10 cycles)*  | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} a, & \text{if}\ a > b \\ b, & \text{otherwise}\ \end{cases}$ <br></br> Fails if $max(a, b) \ge 2^{32}$ |
| u32unchecked_max <br></br> - *(9 cycles)* | [b, a, ...] | [c, ...]         | $c \leftarrow \begin{cases} a, & \text{if}\ a > b \\ b, & \text{otherwise}\ \end{cases}$ <br></br> Undefined if $max(a, b) \ge 2^{32}$ |
