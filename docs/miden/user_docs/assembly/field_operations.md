---
id: field_operations
title: Field Operations 
sidebar_label: Field Operations
description: "Tables of operations with raw field elements."
keywords:
  - docs
  - matic
  - polygon
  - miden
  - operation
image: https://wiki.polygon.technology/img/thumbnail/polygon-miden.png
---

Miden assembly provides a set of instructions which can perform operations with raw field elements. These instructions are described in the tables below.

While most operations place no restrictions on inputs, some operations expect inputs to be binary values, and fail if executed with non-binary inputs.

For instructions where one or more operands can be provided as immediate parameters (e.g., `add` and `add.b`), we provide stack transition diagrams only for the non-immediate version. For the immediate version, it can be assumed that the operand with the specified name is not present on the stack.

### Assertions and tests

| Instruction                     | Stack_input | Stack_output  | Notes                                                            |
| ------------------------------- | ----------- | ------------- | ---------------------------------------------------------------- |
| assert <br></br> - *(1 cycle)*       | [a, ...]    | [...]         | If $a = 1$, removes it from the stack. <br></br> Fails if $a \ne 1$   |
| assertz <br></br> - *(2 cycles)*     | [a, ...]    | [...]         | If $a = 0$, removes it from the stack, <br></br> Fails if $a \ne 0$   |
| assert_eq <br></br> - *(2 cycles)*   | [b, a, ...] | [...]         | If $a = b$, removes them from the stack. <br></br> Fails if $a \ne b$ |
| assert_eqw <br></br> - *(11 cycles)* | [B, A, ...] | [...]         | If $A = B$, removes them from the stack. <br></br> Fails if $A \ne B$ |


### Arithmetic and Boolean operations

| Instruction                                                                    | Stack_input | Stack_output  | Notes                                                                                                        |
| ------------------------------------------------------------------------------ | ----------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| add <br></br> - *(1 cycle)*  <br></br> add.*b* <br></br> - *(1-2 cycle)*                      | [b, a, ...] | [c, ...]      | $c \leftarrow (a + b) \mod p$                                                                                |
| sub <br></br> - *(2 cycles)*  <br></br> sub.*b* <br></br> - *(2 cycles)*                      | [b, a, ...] | [c, ...]      | $c \leftarrow (a - b) \mod p$                                                                                |
| mul <br></br> - *(1 cycle)*  <br></br> mul.*b* <br></br> - *(2 cycles)*                       | [b, a, ...] | [c, ...]      | $c \leftarrow (a \cdot b) \mod p$                                                                            |
| div <br></br> - *(2 cycles)*  <br></br> div.*b* <br></br> - *(2 cycles)*                      | [b, a, ...] | [c, ...]      | $c \leftarrow (a \cdot b^{-1}) \mod p$ <br></br> Fails if $b = 0$                                                 |
| neg <br></br> - *(1 cycle)*                                                         | [a, ...]    | [b, ...]      | $b \leftarrow -a \mod p$                                                                                     |
| inv <br></br> - *(1 cycle)*                                                         | [a, ...]    | [b, ...]      | $b \leftarrow a^{-1} \mod p$ <br></br> Fails if $a = 0$                                                           |
| pow2 <br></br> - *(16 cycles)*                                                      | [a, ...]    | [b, ...]      | $b \leftarrow 2^a$ <br></br> Fails if $a > 63$                                                                    |
| exp.*uxx* <br></br> - *(9 + xx cycles)*  <br></br> exp.*b* <br></br> - *(9 + log2(b) cycles)* | [b, a, ...] | [c, ...]      | $c \leftarrow a^b$ <br></br> Fails if xx is outside [0, 63) <br></br> exp is equivalent to exp.u64 and needs 73 cycles |
| not <br></br> - *(1 cycle)*                                                         | [a, ...]    | [b, ...]      | $b \leftarrow 1 - a$ <br></br> Fails if $a > 1$                                                                   |
| and <br></br> - *(1 cycle)*                                                         | [b, a, ...] | [c, ...]      | $c \leftarrow a \cdot b$ <br></br> Fails if $max(a, b) > 1$                                                       |
| or <br></br> - *(1 cycle)*                                                          | [b, a, ...] | [c, ...]      | $c \leftarrow a + b - a \cdot b$ <br></br> Fails if $max(a, b) > 1$                                               |
| xor <br></br> - *(7 cycles)*                                                        | [b, a, ...] | [c, ...]      | $c \leftarrow a + b - 2 \cdot a \cdot b$ <br></br> Fails if $max(a, b) > 1$                                       |

### Comparison operations

| Instruction                                                | Stack_input | Stack_output   | Notes                                                                                                                        |
| ---------------------------------------------------------- | ----------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| eq <br></br> - *(1 cycle)*  <br></br> eq.*b* <br></br> - *(1-2 cycles)*   | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a=b \\ 0, & \text{otherwise}\ \end{cases}$                                       |
| neq <br></br> - *(2 cycle)*  <br></br> neq.*b* <br></br> - *(2-3 cycles)* | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a \ne b \\ 0, & \text{otherwise}\ \end{cases}$                                   |
| lt <br></br> - *(17 cycles)*                                    | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a < b \\ 0, & \text{otherwise}\ \end{cases}$                                     |
| lte <br></br> - *(18 cycles)*                                   | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a \le b \\ 0, & \text{otherwise}\ \end{cases}$                                   |
| gt <br></br> - *(18 cycles)*                                    | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a > b \\ 0, & \text{otherwise}\ \end{cases}$                                     |
| gte <br></br> - *(19 cycles)*                                   | [b, a, ...] | [c, ...]       | $c \leftarrow \begin{cases} 1, & \text{if}\ a \ge b \\ 0, & \text{otherwise}\ \end{cases}$                                   |
| is_odd <br></br> - *(5 cycles)*                                 | [a, ...]    | [b, ...]       | $b \leftarrow \begin{cases} 1, & \text{if}\ a \text{ is odd} \\ 0, & \text{otherwise}\ \end{cases}$                          |
| eqw <br></br> - *(15 cycles)*                                   | [A, B, ...] | [c, A, B, ...] | $c \leftarrow \begin{cases} 1, & \text{if}\ a_i = b_i \; \forall i \in \{0, 1, 2, 3\} \\ 0, & \text{otherwise}\ \end{cases}$ |

### Extension Field Operations

| Instruction                        | Stack Input | Stack Output | Notes                                                        |
| ---------------------------------- | ----------- | ------------ | ------------------------------------------------------------ |
| ext2add <br></br> - *(5 cycles)*  <br></br>  | [b, a, ...] | [c, ...]     | $c \leftarrow (a + b) \mod q$                                |
| ext2sub <br></br> - *(7 cycles)*  <br></br>  | [b, a, ...] | [c, ...]     | $c \leftarrow (a - b) \mod q$                                |
| ext2mul <br></br> - *(3 cycles)*  <br></br>  | [b, a, ...] | [c, ...]     | $c \leftarrow (a \cdot b) \mod q$                            |
| ext2div <br></br> - *(11 cycles)*  <br></br> | [b, a, ...] | [c, ...]     | $c \leftarrow (a \cdot b^{-1}) \mod q$ <br></br> Fails if $b = 0$ |
| ext2neg <br></br> - *(4 cycles)*  <br></br>  | [a, ...]    | [b, ...]     | $b \leftarrow -a \mod q$                                     |
| ext2inv <br></br> - *(8 cycles)*  <br></br>  | [a, ...]    | [b, ...]     | $b \leftarrow a^{-1} \mod q$ <br></br> Fails if $a = 0$           |

where $q$ is an irreducible polynomial $x^2 - x + 2$ over $F_p$ for $p = 2^{64} - 2^{32} + 1$
