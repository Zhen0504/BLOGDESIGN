---
title: 从零手搓一个神经网络：我的 MNIST 学习记录
date: 2026-09-27
summary: 用纯 NumPy 实现神经网络，记录推导、代码、梯度检验与 MNIST 训练结果。
tags: [学习笔记, 神经网络, NumPy, MNIST]
---


> 这篇是我 7 月中旬跟着 B 站 UP 主 **大野喵渣** 的《从零开始的神经网络》系列，用纯 NumPy 手搓神经网络的学习记录。全程不调 PyTorch / TensorFlow，所有前向传播、反向传播、梯度下降都是自己一行行写出来的。
>
> 文中的图都是我事后用同一份代码（固定随机种子）重新跑出来画的，数字是真实的训练结果，不是示意。完整代码放在文末附录。

## 0. 为什么要手搓

之前学机器学习一直是 `sklearn` 一把梭，模型对我来说是黑盒。神经网络更是如此——知道有"反向传播"这个词，但说不清楚它到底在算什么。

所以这次的目标很简单：**不依赖任何框架，把一个能识别手写数字的网络从零写出来**，逼着自己把每个矩阵的形状、每个导数的来历都搞明白。

最终成果是一个 `784 → 100 → 10` 的三层全连接网络，在 MNIST 测试集上准确率 **97.19%**。数字不算亮眼，但每一个百分点我都知道是怎么来的。

![最终网络结构](/blog/neural-network-from-scratch/images/network_arch.png)

整个过程分成六期，加上一段热身。下面按时间顺序记录。

---

## 1. 热身：一个神经元能学会什么

正式开始 MNIST 之前，我先看了一个极简的例子：**一个神经元，3 个输入，1 个输出**。

### 1.1 单个神经元

```python
from numpy import random, dot, exp, array

# 4 个样本，每个样本 3 个特征
x = array([[0,0,1],[1,1,1],[1,0,1],[0,1,1]])
y = array([[0,1,1,0]]).T          # 正确答案，转置成列向量 (4,1)

random.seed(1)
weights = 2 * random.random((3, 1)) - 1   # 权重取值范围 [-1, 1]

for it in range(10000):
    z = dot(x, weights)                 # 加权求和
    output = 1 / (1 + exp(-z))          # sigmoid，压到 0~1
    error = y - output                  # 差了多少
    slope = output * (1 - output)       # sigmoid 在当前位置的斜率
    delta = error * slope               # 调整信号
    weights += dot(x.T, delta)          # 更新权重
```

仔细看这个数据：`y` 其实就是每个样本的第一个特征。这种"线性可分"的规律，一个神经元就能学会。

当时最困惑的是 `delta = error * slope` 这一行——为什么要乘斜率？后来想通了，这五行就是一次完整的"前向 + 反向"：

- `weights` 决定 `z`，`z` 经过 sigmoid 得到预测 `output`
- `error` 告诉模型**错了多少、往哪边改**
- `slope` 告诉模型**现在动权重，输出会不会跟着明显变**——如果 sigmoid 已经饱和（输出接近 0 或 1），斜率接近 0，哪怕错得再多，传回去的信号也很弱
- `delta` 就是两者的乘积：错得多、且当前位置容易改 → 多调；错得少或者改不动 → 少调
- 最后 `dot(x.T, delta)`：哪个输入大，就该为这个误差多负责，权重也多改一点

**循环 10000 次的目的不是重复计算，而是让权重每一轮都被推一点，最终推到能拟合规律的位置。** 这就是梯度下降最朴素的样子。

### 1.2 换个数据，它就不行了

把数据换成这样：

```python
X = array([[0,0,1],[0,1,1],[1,0,1],[1,1,1]])
y = array([[0,1,1,0]]).T
```

现在 `y` 是前两个特征的**异或（XOR）**。同样的代码跑完，四个输出全部是 0.5——它彻底放弃了。

![单个神经元 vs 两层网络](/blog/neural-network-from-scratch/images/toy_xor.png)

原因是一个神经元本质上只能画一条直线（或者说一个超平面），而 XOR 的两类点不可能用一条直线分开。**这就是为什么需要"深度"——多加一层隐藏层。**

### 1.3 两层网络：第一次接触反向传播

```python
def fp(input):                          # forward propagation
    l1 = 1/(1 + exp(-dot(input, w0)))   # 隐藏层，4 个神经元
    l2 = 1/(1 + exp(-dot(l1, w1)))      # 输出层，1 个神经元
    return l1, l2

def bp(l1, l2, y):                      # back propagation
    error = y - l2
    slope = l2 * (1 - l2)
    l1_delta = error * slope            # 输出层的调整信号（和单神经元一样）

    l0_slope = l1 * (1 - l1)
    l0_error = l1_delta.dot(w1.T)       # ★ 把输出层的信号沿着连接传回隐藏层
    l0_delta = l0_error * l0_slope
    return l0_delta, l1_delta

w0 = random.random((3, 4)) * 2 - 1      # 3 个输入 × 4 个隐藏神经元
w1 = random.random((4, 1)) * 2 - 1      # 4 个隐藏神经元 × 1 个输出

for it in range(10000):
    l0 = X
    l1, l2 = fp(l0)
    l0_delta, l1_delta = bp(l1, l2, y)
    w1 += dot(l1.T, l1_delta)
    w0 += dot(l0.T, l0_delta)
```

权重的数量怎么数：**上一层每个神经元都要和下一层每个神经元连一条线，每条线一个权重**，所以 `w0` 是 3×4，`w1` 是 4×1。

和单神经元相比，唯一新增的东西是 `l0_error = l1_delta.dot(w1.T)`。它最直白的翻译是：

> 输出层现在有一个调整信号，把它沿着原来的连接**反向**传回去；每条连接按照自己的权重决定传回多少、方向是什么。

这一行就是"反向传播"这个名字的全部含义。跑完之后四个输出是 `[0.01, 0.989, 0.991, 0.013]`，XOR 学会了。

---

## 2. 第一期：搭骨架

热身结束，正式进入 MNIST。第一期只做一件事：**把网络的结构和参数搭出来，能前向算出一个结果就行**，先不管对不对。

### 2.1 网络设计

第一版网络非常简单：输入 784 维（28×28 的图片展平），输出 10 维（10 个数字的概率）。

- 第 0 层：`l0 = tanh(img + b0)`，`b0` 是 784 维的偏置
- 第 1 层：`output = softmax(l0 · w1 + b1)`，`w1` 是 784×10，`b1` 是 10 维

（这个"输入直接加偏置再过 tanh"的设计是视频里的，后面第六期会改成更标准的写法。）

### 2.2 两个激活函数

```python
def tanh(x):
    return np.tanh(x)

def softmax(x):
    exp = np.exp(x - x.max())
    return exp / exp.sum()
```

softmax 和 sigmoid 很像，但它处理的是**一组数**：把一个向量变成一组和为 1 的概率。

`x - x.max()` 这个小动作我一开始不理解。数学上，分子分母同时乘 $e^{-\max}$ 结果不变；但工程上，如果 `x` 里有个 1000，`np.exp(1000)` 直接溢出成 `inf`。**减最大值不影响结果，还能防止指数爆炸**——这是写 softmax 的标准操作。

![激活函数及其导数](/blog/neural-network-from-scratch/images/activations.png)

### 2.3 参数初始化：为什么 b 可以全 0，w 不能

```python
dimensions = [28*28, 10]
activations = [tanh, softmax]

distribution = [
    {'b': [0, 0]},
    {'b': [0, 0],
     'w': [-math.sqrt(6/(dimensions[0]+dimensions[1])),
            math.sqrt(6/(dimensions[0]+dimensions[1]))]},
]

def init_parameters_b(layer):
    dist = distribution[layer]['b']
    return np.random.rand(dimensions[layer]) * (dist[1] - dist[0]) + dist[0]

def init_parameters_w(layer):
    dist = distribution[layer]['w']
    return np.random.rand(dimensions[layer-1], dimensions[layer]) * (dist[1] - dist[0]) + dist[0]
```

`np.random.rand` 生成 0~1 的随机数，乘以 `(dist[1]-dist[0])` 再加 `dist[0]`，就得到 `[dist[0], dist[1]]` 之间的均匀随机数。这是把区间缩放的通用套路。

权重的范围 $\pm\sqrt{6/(n_{in}+n_{out})}$ 是 Xavier 初始化，视频里说"有原因但不深究"，我也先记下来。但**为什么偏置可以全 0、权重不能**这一点必须想明白：

> 如果权重全为 0，同一层所有神经元的计算结果完全一样，更新也完全一样，它们最终会学成同一个东西——相当于这一层只有一个神经元。
>
> **权重随机初始化，是为了打破神经元之间的对称性；权重范围受控制，是为了让信号和梯度保持稳定；偏置则通常可以直接初始化为 0。**

### 2.4 前向传播

```python
def predict(img, parameters):
    l0_in  = img + parameters[0]['b']
    l0_out = activations[0](l0_in)
    l1_in  = np.dot(l0_out, parameters[1]['w']) + parameters[1]['b']
    l1_out = activations[1](l1_in)
    return l1_out

print(predict(np.random.rand(28*28), parameters).argmax())
```

喂一张随机噪声进去，它会吐出一个 0~9 的数字。当然是瞎猜的——但骨架通了。

---

## 3. 第二期：把 MNIST 读进来

MNIST 的原始文件不是图片，是二进制文件。第二期就是把它们解析成 NumPy 数组。

![MNIST 样本](/blog/neural-network-from-scratch/images/mnist_samples.png)

### 3.1 `struct.unpack('>4i', f.read(16))` 是什么

```python
with open(train_img_path, 'rb') as f:
    struct.unpack('>4i', f.read(16))
    tmp_img = np.fromfile(f, dtype=np.uint8).reshape(-1, 28*28)
    train_img = tmp_img[:train_num]
    valid_img = tmp_img[train_num:]
```

`'rb'` 表示以二进制方式读。文件开头 16 个字节是文件头（魔数、图片数、行数、列数），读出来长这样：`b'\x00\x00\x08\x03\x00\x00\xea\x60...'`，人看不懂，所以要用 `struct` 把字节翻译成整数。

`'>4i'` 拆成三部分：

| 符号 | 含义 |
|---|---|
| `>` | 大端字节序（高位字节在前）。MNIST 规定用大端存整数，所以必须写 |
| `4` | 后面的类型重复 4 次 |
| `i` | 一个 4 字节整数 |

4 × 4 字节 = 16 字节，所以配 `f.read(16)`。标签文件头只有 2 个整数，所以是 `'>2i'` 和 `f.read(8)`。

其实这一行的返回值我们根本没用，目的只是**把文件指针跳过文件头**，让后面的 `np.fromfile` 从真正的像素数据开始读。

### 3.2 两次 reshape 的作用不一样

```python
tmp_img = np.fromfile(f, dtype=np.uint8).reshape(-1, 28*28)   # 第一次
plt.imshow(train_img[index].reshape(28, 28), cmap='gray')     # 第二次
```

- 第一次 `reshape(-1, 784)`：`fromfile` 读出来是一条长长的一维数组，按每 784 个一组切成"n 行 784 列"，每行一张图。`-1` 表示行数让 NumPy 自己算。
- 第二次 `reshape(28, 28)`：把某一张图从 784 维恢复成 28×28 的二维矩阵，才能显示出来。

![一张图片的原始数值](/blog/neural-network-from-scratch/images/mnist_matrix.png)

### 3.3 训练集 / 验证集 / 测试集

MNIST 给了 60000 张训练图和 10000 张测试图。我把训练图再切成 **50000 训练 + 10000 验证**：训练集用来更新参数，验证集用来看有没有过拟合（第五期会用到），测试集最后只看一次。

---

## 4. 第三期：梯度下降与反向传播推导

这是最难也最重要的一期。第一、二期是搭积木，第三期要回答：**参数到底该往哪个方向改？**

### 4.1 损失函数

先要有一个"错了多少"的度量。这里用平方损失：

```python
onehot = np.identity(dimensions[-1])     # 10×10 单位矩阵，第 k 行就是数字 k 的 one-hot

def sqr_loss(img, lab, parameters):
    y_pred = predict(img, parameters)     # 例如 [0.1, 0.7, 0.2, ...]
    y = onehot[lab]                       # 例如 [0,   1,   0,   ...]
    diff = y_pred - y
    return np.dot(diff, diff)             # 各分量平方和
```

`np.identity(10)` 生成单位矩阵，直接当 one-hot 标签表用，`onehot[3]` 就是 `[0,0,0,1,0,0,0,0,0,0]`。`np.dot(diff, diff)` 是向量自己点乘自己，等于各元素平方和。

损失 $L$ 依赖于所有参数，所以可以通过改参数来改 $L$。**梯度下降就是：算出 $L$ 对每个参数的偏导，然后往偏导的反方向挪一小步。**

### 4.2 推导：三个梯度

先用符号把前向传播写清楚：

$$
z_0 = x + b_0,\quad a_0 = \tanh(z_0),\quad z_1 = a_0 W_1 + b_1,\quad \hat y = \mathrm{softmax}(z_1)
$$

$$
L = \sum_j (\hat y_j - y_j)^2 \quad\Rightarrow\quad \frac{\partial L}{\partial \hat y} = 2(\hat y - y) = -2\,\text{diff}
$$

（代码里 `diff = onehot[lab] - l1_out`，也就是 $y - \hat y$，所以带一个负号。）

然后沿着链式法则一层层往回走。

**① 输出层偏置 $b_1$。** $b_1$ 直接加在 $z_1$ 上，$\partial z_1/\partial b_1 = I$，所以：

$$
\frac{\partial L}{\partial b_1} = \frac{\partial L}{\partial \hat y}\cdot\frac{\partial \hat y}{\partial z_1} = -2\,J_{\text{softmax}}\,\text{diff}
$$

代码里把 $J_{\text{softmax}}\,\text{diff}$ 记作 `act1`，于是 `grad_b1 = -2 * act1`。

**② 输出层权重 $W_1$。** 对某一个权重 $W_{1,ij}$，它只影响 $z_{1,j}$，且 $\partial z_{1,j}/\partial W_{1,ij} = a_{0,i}$。所以：

$$
\frac{\partial L}{\partial W_{1,ij}} = a_{0,i}\cdot\frac{\partial L}{\partial z_{1,j}} = -2\,a_{0,i}\,\text{act1}_j
$$

**每个权重的梯度 = 上一层对应的输出 × 下一层对应的误差信号。** 把所有 $(i,j)$ 组合排成矩阵，正好是两个向量的**外积**：

$$
\frac{\partial L}{\partial W_1} = -2\,(a_0 \otimes \text{act1}) \quad\Rightarrow\quad \texttt{grad\_w1 = -2 * np.outer(l0\_out, act1)}
$$

$a_0$ 是 784 维，act1 是 10 维，外积是 784×10——刚好和 $W_1$ 形状一样。这就是为什么权重梯度是外积：**要保留每个输入与每个输出梯度之间的所有组合**。

**③ 输入层偏置 $b_0$。** 路径最长：$b_0 \to z_0 \to a_0 \to z_1 \to \hat y \to L$。

$$
\frac{\partial L}{\partial b_0} = -2\,\tanh'(z_0)\odot(W_1\,\text{act1})
$$

分两步理解：
1. `np.dot(parameters[1]['w'], act1)`：形状 (784,10)·(10,) → (784,)，**把输出层的 10 个误差信号通过权重传回 784 个隐藏神经元**——和热身里的 `l1_delta.dot(w1.T)` 是同一件事。
2. 再逐元素乘上 tanh 的导数 $1/\cosh^2 z_0$——**经过激活函数时要乘它的斜率**，和热身里的 `slope` 一样。

### 4.3 两个激活函数的导数

**tanh** 是逐元素的，导数也逐元素：

$$
\frac{d}{dx}\tanh x = \frac{1}{\cosh^2 x} = 1 - \tanh^2 x
$$

**softmax** 是向量进向量出，导数是一个雅可比矩阵。用商法则推：

$$
\frac{\partial s_i}{\partial x_j} =
\begin{cases}
s_i(1 - s_i), & i = j \\
-s_i s_j, & i \ne j
\end{cases}
\quad\Longrightarrow\quad
J = \mathrm{diag}(\mathbf s) - \mathbf s\mathbf s^{T}
$$

对角线是 $s_i(1-s_i)$，非对角线是 $-s_i s_j$。写成矩阵就是"对角矩阵减外积"，代码一行：

```python
def d_softmax(data):
    sm = softmax(data)
    return np.diag(sm) - np.outer(sm, sm)   # diag 生成对角矩阵，outer 计算外积
```

### 4.4 一个优化：d_tanh 不返回矩阵，返回向量

严格来说 tanh 的雅可比矩阵也是个矩阵（对角矩阵）：

```python
def d_tanh(data):
    return np.diag(1 / np.cosh(data) ** 2)     # 784×784 的对角矩阵
```

但后面用它的地方是"对角矩阵 × 向量"，而 $\mathrm{diag}(d)\,v = d \odot v$，直接逐元素乘就行：

```python
def d_tanh(data):
    return 1 / np.cosh(data) ** 2              # 只返回对角线上的 784 个数
```

对角矩阵要存 784×784 = 61 万个数（其中 99.9% 是 0），向量只要 784 个。这个优化的代价是：**两种写法返回的形状不同**，softmax 那边是真矩阵要用 `np.dot`，tanh 这边是向量要用 `*`。第六期会用一个 `d_type` 字典统一处理这个区别。

### 4.5 梯度计算的完整代码

```python
differential = {softmax: d_softmax, tanh: d_tanh}

def grad_parameters(img, lab, parameters):
    # 前向，把中间结果留下来
    l0_in  = img + parameters[0]['b']
    l0_out = activations[0](l0_in)
    l1_in  = np.dot(l0_out, parameters[1]['w']) + parameters[1]['b']
    l1_out = activations[1](l1_in)

    # 反向
    diff = onehot[lab] - l1_out
    act1 = np.dot(differential[activations[1]](l1_in), diff)   # J_softmax · diff

    grad_b1 = -2 * act1
    grad_w1 = -2 * np.outer(l0_out, act1)
    grad_b0 = -2 * differential[activations[0]](l0_in) * np.dot(parameters[1]['w'], act1)

    return {'w1': grad_w1, 'b1': grad_b1, 'b0': grad_b0}
```

### 4.6 我怎么确认自己没推错：数值梯度检验

推导很容易错一个符号或者漏一个转置，而错了的网络照样能跑，只是学不好。所以视频里教了一个我觉得**非常值得养成习惯**的方法：用导数的定义去验证。

$$
\frac{\partial L}{\partial \theta} \approx \frac{L(\theta + h) - L(\theta)}{h}
$$

```python
h = 0.00001
for i in range(10):
    img_i = np.random.randint(train_num)
    test_parameters = init_parameters()
    derivative = grad_parameters(train_img[img_i], train_lab[img_i], test_parameters)['b1']
    value1 = sqr_loss(train_img[img_i], train_lab[img_i], test_parameters)
    test_parameters[1]['b'][i] += h                     # 把第 i 个参数挪一点点
    value2 = sqr_loss(train_img[img_i], train_lab[img_i], test_parameters)
    print(derivative[i] - (value2 - value1) / h)         # 公式算的 vs 定义算的
```

对 `b1`、`w1`、`b0` 各做一遍，差值都在 $10^{-6}$ 量级。我重跑时对最终网络的四组参数抽查，最大偏差是 $5.9\times10^{-7}$——推导是对的。

---

## 5. 第四期：真正开始训练

有了梯度，训练就是一个循环：**算梯度 → 更新参数 → 再算梯度**。

### 5.1 mini-batch：100 张图算一次平均梯度

一张图算一次梯度就更新，方向太抖；50000 张全算完再更新，又太慢。折中方案是每 100 张一批（batch），用平均梯度更新一次：

```python
batch_size = 100

def train_batch(current_batch, parameters):
    # 用第一张图初始化梯度累加器
    grad_accu = grad_parameters(train_img[current_batch*batch_size+0],
                                train_lab[current_batch*batch_size+0], parameters)
    # 剩下 99 张累加进去
    for img_i in range(1, batch_size):
        grad = grad_parameters(train_img[current_batch*batch_size+img_i],
                               train_lab[current_batch*batch_size+img_i], parameters)
        for key in grad.keys():
            grad_accu[key] += grad[key]
    # 取平均
    for key in grad_accu.keys():
        grad_accu[key] /= batch_size
    return grad_accu
```

### 5.2 更新参数

```python
def combine_parameters(parameters, grad, learn_rate):
    parameters_tmp = copy.deepcopy(parameters)     # 深拷贝，不改原参数
    parameters_tmp[0]['b'] -= learn_rate * grad['b0']   # 新参数 = 旧参数 − 学习率 × 梯度
    parameters_tmp[1]['w'] -= learn_rate * grad['w1']
    parameters_tmp[1]['b'] -= learn_rate * grad['b1']
    return parameters_tmp
```

`copy.deepcopy` 这里是必须的：`parameters` 是一个嵌套了字典和数组的列表，浅拷贝只会复制最外层，里面的数组还是同一份内存，`-=` 会直接改掉原参数。第五期做学习率实验时要用同一份参数试很多个学习率，如果原参数被改了实验就全错了。

### 5.3 跑一个 epoch

```python
parameters = init_parameters()
valid_accuracy(parameters)          # 训练前：约 6%~11%，就是瞎猜
learn_rate = 1

for i in range(train_num // batch_size):      # 50000 / 100 = 500 个 batch
    grad_tmp = train_batch(i, parameters)
    parameters = combine_parameters(parameters, grad_tmp, learn_rate)

valid_accuracy(parameters)
```

500 个 batch 依次跑一遍，就是把全部训练数据看了一轮，叫一个 **epoch**。第一次跑完看到验证集准确率从个位数跳到 90% 的时候，是整个过程里最爽的一刻。

---

## 6. 第五期：学习率与过拟合

第四期能跑了，但有两个问题：学习率 1 是拍脑袋定的；训练几轮合适也不知道。第五期就是解决这两件事。不过在此之前，先修一个 bug。

### 6.1 代码勘误：忘了 /255

```python
tmp_img = np.fromfile(f, dtype=np.uint8).reshape(-1, 28*28)         # 之前
tmp_img = np.fromfile(f, dtype=np.uint8).reshape(-1, 28*28) / 255   # 现在
```

像素值是 0~255 的整数。第一版网络的第 0 层是 `tanh(img + b0)`，把 0~255 直接喂进 tanh 会怎样？

![归一化前后 tanh 输出的分布](/blog/neural-network-from-scratch/images/saturation.png)

**非零像素几乎全部被压到 1**，图片被"二值化"了：一个像素是 30 还是 250，网络看到的都是 1。更糟的是 tanh 在这些位置的斜率 $1/\cosh^2 x \approx 0$，梯度传不回去，`b0` 基本学不动。除以 255 把像素压到 0~1，tanh 就工作在它有斜率的区间里了。

这个坑给我的教训是：**输入的数值范围要和激活函数的"工作区间"匹配**。后来知道这叫归一化，是所有神经网络的标配预处理。

### 6.2 学习率怎么选：扫一遍

学习率太小，走得慢；太大，会在最低点两边来回跳甚至越跳越高。视频里的方法很直接：**固定一个 batch 的梯度，用不同学习率各更新一步，看哪个 loss 降得最多。**

```python
rand_batch = np.random.randint(train_num // batch_size)
grad_lr = train_batch(rand_batch, parameters)      # 只算一次梯度

lr_list = []
lower, upper, step = -5, 2, 1                      # 学习率取 10^-5 ~ 10^2
num = int(round((upper - lower) / step)) + 1
for lr_pow in np.linspace(lower, upper, num):
    learn_rate = 10 ** lr_pow
    parameters_tmp = combine_parameters(parameters, grad_lr, learn_rate)  # 同一梯度，不同步长
    lr_list.append([lr_pow, train_loss(parameters_tmp)])                  # 更新后的 loss
```

![学习率扫描](/blog/neural-network-from-scratch/images/lr_sweep.png)

左图是随机初始参数上的粗扫：学习率从 $10^{-5}$ 到 $10^{-1}$ 都太小，loss 几乎不动；$10^0$ 处最低；$10^1$ 开始 loss 反而升高——**步子迈过头，从最低点冲到对面山坡上去了**。

右图是训练 10 轮之后再细扫 $10^{-2}$ 到 $10^{0.5}$：最低点在 $10^{-0.4} \approx 0.4$ 左右，之后陡然上升。视频里也扫到 0.4 附近，但**不会直接选最低点**——因为这只是某一个 batch 的结果，换一个 batch 最低点会挪。合理的做法是在下降趋势上稍微保守一点选，比如 $10^{-0.5}$ 或 $10^{-0.6}$。

另外记一笔：梯度下降可能陷入局部最优，还有鞍点问题（比局部最优更常见）。学习率扫描只能帮我们避开"步子太大"，解决不了这些。

### 6.3 训练多轮，同时盯着验证集

```python
def valid_loss(parameters):
    loss_accu = 0
    for img_i in range(valid_num):
        loss_accu += sqr_loss(valid_img[img_i], valid_lab[img_i], parameters)
    return loss_accu / (valid_num / 10000)     # 训练集 5 万、验证集 1 万，按每 1 万张归一才能放一张图上比

def valid_accuracy(parameters):
    correct = [predict(valid_img[i], parameters).argmax() == valid_lab[i] for i in range(valid_num)]
    return correct.count(True) / len(correct)

# train_loss / train_accuracy 同理

learn_rate = 10 ** -0.6
epoch_num = 10
for epoch in tqdm(range(epoch_num)):
    for i in range(train_num // batch_size):
        grad_tmp = train_batch(i, parameters)
        parameters = combine_parameters(parameters, grad_tmp, learn_rate)
    train_loss_list.append(train_loss(parameters))
    valid_loss_list.append(valid_loss(parameters))
    train_accu_list.append(train_accuracy(parameters))
    valid_accu_list.append(valid_accuracy(parameters))
```

每个 epoch 结束都把训练集、验证集的 loss 和准确率记下来，画成曲线。用第一版网络（784→10）跑 5 轮，验证集准确率是 90.63% → 91.43% → 91.57% → 91.74% → **92.02%**，测试集 91.96%。

### 6.4 什么是过拟合

下面这两张图是最终网络（第六期）的曲线，但过拟合的现象在这里讲最合适：

![loss 曲线](/blog/neural-network-from-scratch/images/loss_curve.png)

![准确率曲线](/blog/neural-network-from-scratch/images/accuracy_curve.png)

前几轮训练集和验证集一起往下走，说明网络在学"通用"的规律。但从第 7~8 轮开始，**训练 loss 继续下降（212），验证 loss 却停在 415 左右不动了**；准确率也是同样的形状——训练集冲到 98.85%，验证集卡在 97.28%。

这意味着网络开始记住训练集里特定图片的细节，而这些细节对没见过的图片没用。**两条线之间的间距，就是过拟合的程度**；验证集曲线不再下降的那个点，就是该停止训练的时候。这也是为什么要单独切一块验证集出来——它替测试集"挡枪"，让我们不用碰测试集就能做这个判断。

---

## 7. 第六期：更复杂的网络

第一版网络的"第 0 层"是 `tanh(img + b0)`，没有权重矩阵，本质上还是一个线性分类器加了点扭曲，所以卡在 92%。第六期要**加一个真正的隐藏层**，同时把代码改成能支持任意层数。

### 7.1 用三个列表描述网络

```python
def bypass(x):            # 输入层不做任何变换
    return x

def d_bypass(data):
    return 1              # 导数是单位矩阵，但直接返回 1 就够了，省计算

differential = {softmax: d_softmax, tanh: d_tanh, bypass: d_bypass}
d_type = {softmax: 'dot', tanh: 'times', bypass: 'times'}   # 导数是矩阵还是向量

dimensions  = [28*28, 100, 10]          # 每层神经元数
activations = [bypass, tanh, softmax]   # 每层激活函数

distribution = [
    {},                                 # 输入层没有参数
    {'b': [0, 0], 'w': [-math.sqrt(6/(dimensions[0]+dimensions[1])), math.sqrt(6/(dimensions[0]+dimensions[1]))]},
    {'b': [0, 0], 'w': [-math.sqrt(6/(dimensions[1]+dimensions[2])), math.sqrt(6/(dimensions[1]+dimensions[2]))]},
]
```

改完以后，想加层、改宽度，只需要改这三个列表。`d_type` 就是第三期那个"softmax 的导数是矩阵、tanh 的导数是向量"的区别，现在用一个字典显式地记下来。

### 7.2 通用的前向传播

```python
def predict(img, parameters):
    l_in  = img
    l_out = activations[0](l_in)
    for layer in range(1, len(parameters)):
        l_in  = np.dot(l_out, parameters[layer]['w']) + parameters[layer]['b']
        l_out = activations[layer](l_in)
    return l_out
```

一个循环：上一层的输出，乘权重加偏置，过激活函数，变成这一层的输出。

### 7.3 通用的反向传播（全文最核心的一段代码）

```python
def grad_parameters(img, lab, parameters):
    # ---- 前向：把每一层的 l_in 和 l_out 都存下来，反向要用 ----
    l_in_list  = [img]
    l_out_list = [activations[0](l_in_list[0])]
    for layer in range(1, len(parameters)):
        l_in  = np.dot(l_out_list[layer-1], parameters[layer]['w']) + parameters[layer]['b']
        l_out = activations[layer](l_in)
        l_in_list.append(l_in)
        l_out_list.append(l_out)

    # ---- 反向：从最后一层开始 ----
    d_layer = -2 * (onehot[lab] - l_out_list[-1])         # ∂L/∂ŷ

    grad_result = [None] * len(dimensions)
    for layer in range(len(parameters)-1, 0, -1):         # 从最后一层倒着走到第 1 层
        # ① 穿过本层激活函数：乘激活函数的导数
        if d_type[activations[layer]] == 'dot':
            d_layer = np.dot(differential[activations[layer]](l_in_list[layer]), d_layer)
        if d_type[activations[layer]] == 'times':
            d_layer = d_layer * differential[activations[layer]](l_in_list[layer])
        # 现在 d_layer = ∂L/∂(l_in)，也就是本层的"误差信号"

        # ② 本层参数的梯度
        grad_result[layer] = {}
        grad_result[layer]['b'] = d_layer                                  # 偏置：直接就是误差信号
        grad_result[layer]['w'] = np.outer(l_out_list[layer-1], d_layer)   # 权重：上一层输出 ⊗ 误差信号

        # ③ 把误差信号通过权重传给上一层
        d_layer = np.dot(parameters[layer]['w'], d_layer)
    return grad_result
```

这段代码把第三期手推的三个公式变成了一个循环，每一圈做三件事，正好对应第三期的三个结论：

| 步骤 | 代码 | 对应第三期 |
|---|---|---|
| ① 穿过激活函数 | `d_layer = J · d_layer` 或 `d_layer * d'` | `act1 = J_softmax · diff`；`* d_tanh(l0_in)` |
| ② 算本层梯度 | `b: d_layer`，`w: outer(上一层输出, d_layer)` | `grad_b1 = -2*act1`，`grad_w1 = -2*outer(l0_out, act1)` |
| ③ 传给上一层 | `d_layer = w · d_layer` | `np.dot(parameters[1]['w'], act1)` |

`-2` 只在最开始乘一次，因为它是 $\partial L/\partial \hat y$ 带来的，之后一路跟着 `d_layer` 往前传。`d_layer` 这个变量名很贴切——它就是"当前层的误差信号"，每穿过一层就变一次形。

这个结构写出来之后，我才真正理解"反向传播"为什么叫**传播**：误差信号像水一样从输出层往输入层流，经过激活函数时按斜率缩放，经过权重时按权重分配，每流过一层就在这一层留下一份梯度。

### 7.4 配套的小工具

梯度现在是"列表套字典"的结构，累加和求平均要改成遍历：

```python
def grad_add(grad1, grad2):
    for layer in range(1, len(grad1)):
        for pname in grad1[layer].keys():
            grad1[layer][pname] += grad2[layer][pname]
    return grad1

def grad_divide(grad, denominator):
    for layer in range(1, len(grad)):
        for pname in grad[layer].keys():
            grad[layer][pname] /= denominator
    return grad

def combine_parameters(parameters, grad, learn_rate):
    parameters_tmp = copy.deepcopy(parameters)
    for layer in range(1, len(parameters)):
        for pname in parameters[layer].keys():
            parameters_tmp[layer][pname] -= learn_rate * grad[layer][pname]
    return parameters_tmp
```

改完之后同样用数值梯度检验把 `b1, w1, b2, w2` 都验了一遍，才敢开始训练。

### 7.5 结果

`784 → 100 → 10`，学习率 1，batch 100，训练 10 轮：

| epoch | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| 训练集准确率 | 93.27 | 95.22 | 96.61 | 97.27 | 97.78 | 98.12 | 98.43 | 98.61 | 98.74 | 98.85 |
| 验证集准确率 | 93.83 | 95.58 | 96.34 | 96.69 | 96.94 | 97.17 | 97.26 | 97.20 | 97.20 | 97.28 |

**测试集准确率 97.19%**，10000 张里错了 281 张。

![有无隐藏层的对比](/blog/neural-network-from-scratch/images/accuracy_compare.png)

加了 100 个神经元的隐藏层，第一轮就超过了旧网络训练 5 轮的成绩。多出来的这 5 个百分点，就是"深度"的价值。

### 7.6 网络到底学到了什么

训练完的 `w[1]` 是 784×100 的矩阵，每一列对应一个隐藏神经元的 784 个输入权重——刚好可以 reshape 回 28×28 画出来看：

![隐藏层权重可视化](/blog/neural-network-from-scratch/images/hidden_weights.png)

红色是正权重（这个位置有笔画会让神经元兴奋），蓝色是负权重（有笔画会抑制它）。能隐约看出一些神经元在检测特定位置的横、竖、弧线。不是很清晰，但确实不是噪声——这些"特征检测器"完全是从数据里自己长出来的。

再看看它错在哪：

![混淆矩阵](/blog/neural-network-from-scratch/images/confusion.png)

![错分样本](/blog/neural-network-from-scratch/images/misclassified.png)

最容易混的是 5→3（17 次）、8→3（14 次）、9→3 / 7→2（各 12 次）、4→9（11 次）。看错分样本会发现，其中不少字我自己也要愣一下才认得出来。

---

## 8. 回头看

### 踩过的坑

1. **忘了 /255**：输入没归一化，tanh 直接饱和。所有数值范围问题里最常见的一个。
2. **softmax 不减最大值**：数学上等价，工程上会溢出。
3. **`d_tanh` 返回对角矩阵还是向量**：形状对了不代表效率对了；但改了形状就要改对应的乘法，靠 `d_type` 字典管起来。
4. **浅拷贝改坏原参数**：嵌套结构一定要 `deepcopy`。
5. **推导对不对不靠感觉**：数值梯度检验几行代码，能省很多小时的瞎调。

### 收获

- 反向传播不神秘，就是链式法则 + 三个动作循环：**乘激活函数导数 → 记下本层梯度 → 乘权重传给上一层**。
- 权重梯度是外积、偏置梯度就是误差信号本身、误差通过 $W$ 而不是 $W^T$ 回传（取决于 $z = aW$ 还是 $z = Wa$ 的约定）——这些以前只能背的结论，现在能从形状推出来。
- 验证集是干什么的、过拟合长什么样、学习率怎么选，都亲眼看到了曲线。

### 下一步

手搓版的局限也很明显：一张图一张图地算梯度，最终网络在我笔记本上一个 epoch 要 40 多秒，而旧网络只要 4 秒——把 batch 向量化成矩阵运算是第一件该做的事。然后是换交叉熵损失代替平方损失（对 softmax 输出更合适）、试试 ReLU、再往后就是卷积网络了。等用 PyTorch 重写一遍，我应该能看懂它每一行在替我做什么。

---

## 参考

- B 站 · 大野喵渣《从零开始的神经网络》系列（视频链接待补）
- MNIST 数据集：Yann LeCun et al., *THE MNIST DATABASE of handwritten digits*
- Xavier Glorot & Yoshua Bengio, *Understanding the difficulty of training deep feedforward neural networks* (2010) —— 权重初始化范围 $\pm\sqrt{6/(n_{in}+n_{out})}$ 的来源

---

## 附录 A：最终完整代码

去掉了绘图和调试部分，保留网络本体和训练循环。运行环境 Python 3.11 + NumPy，MNIST 四个文件放在 `./MNIST/`。

```python
import numpy as np
import math
import struct
import copy
from pathlib import Path

# ---------- 数据 ----------
dataset_path = Path('./MNIST')
train_img_path = dataset_path / 'train-images.idx3-ubyte'
train_lab_path = dataset_path / 'train-labels.idx1-ubyte'
test_img_path  = dataset_path / 't10k-images.idx3-ubyte'
test_lab_path  = dataset_path / 't10k-labels.idx1-ubyte'

train_num, valid_num, test_num = 50000, 10000, 10000

with open(train_img_path, 'rb') as f:
    struct.unpack('>4i', f.read(16))
    tmp_img = np.fromfile(f, dtype=np.uint8).reshape(-1, 28*28) / 255
    train_img, valid_img = tmp_img[:train_num], tmp_img[train_num:]
with open(test_img_path, 'rb') as f:
    struct.unpack('>4i', f.read(16))
    test_img = np.fromfile(f, dtype=np.uint8).reshape(-1, 28*28) / 255
with open(train_lab_path, 'rb') as f:
    struct.unpack('>2i', f.read(8))
    tmp_lab = np.fromfile(f, dtype=np.uint8)
    train_lab, valid_lab = tmp_lab[:train_num], tmp_lab[train_num:]
with open(test_lab_path, 'rb') as f:
    struct.unpack('>2i', f.read(8))
    test_lab = np.fromfile(f, dtype=np.uint8)

# ---------- 激活函数及导数 ----------
def bypass(x):
    return x

def tanh(x):
    return np.tanh(x)

def softmax(x):
    exp = np.exp(x - x.max())
    return exp / exp.sum()

def d_softmax(data):
    sm = softmax(data)
    return np.diag(sm) - np.outer(sm, sm)

def d_tanh(data):
    return 1 / np.cosh(data) ** 2

def d_bypass(data):
    return 1

differential = {softmax: d_softmax, tanh: d_tanh, bypass: d_bypass}
d_type = {softmax: 'dot', tanh: 'times', bypass: 'times'}

# ---------- 网络结构 ----------
dimensions  = [28*28, 100, 10]
activations = [bypass, tanh, softmax]
distribution = [
    {},
    {'b': [0, 0], 'w': [-math.sqrt(6/(dimensions[0]+dimensions[1])), math.sqrt(6/(dimensions[0]+dimensions[1]))]},
    {'b': [0, 0], 'w': [-math.sqrt(6/(dimensions[1]+dimensions[2])), math.sqrt(6/(dimensions[1]+dimensions[2]))]},
]

def init_parameters_b(layer):
    dist = distribution[layer]['b']
    return np.random.rand(dimensions[layer]) * (dist[1] - dist[0]) + dist[0]

def init_parameters_w(layer):
    dist = distribution[layer]['w']
    return np.random.rand(dimensions[layer-1], dimensions[layer]) * (dist[1] - dist[0]) + dist[0]

def init_parameters():
    parameter = []
    for i in range(len(distribution)):
        layer_parameter = {}
        for j in distribution[i].keys():
            if j == 'b':
                layer_parameter['b'] = init_parameters_b(i)
            elif j == 'w':
                layer_parameter['w'] = init_parameters_w(i)
        parameter.append(layer_parameter)
    return parameter

# ---------- 前向 / 损失 / 反向 ----------
def predict(img, parameters):
    l_in = img
    l_out = activations[0](l_in)
    for layer in range(1, len(parameters)):
        l_in = np.dot(l_out, parameters[layer]['w']) + parameters[layer]['b']
        l_out = activations[layer](l_in)
    return l_out

onehot = np.identity(dimensions[-1])

def sqr_loss(img, lab, parameters):
    diff = predict(img, parameters) - onehot[lab]
    return np.dot(diff, diff)

def grad_parameters(img, lab, parameters):
    l_in_list = [img]
    l_out_list = [activations[0](l_in_list[0])]
    for layer in range(1, len(parameters)):
        l_in = np.dot(l_out_list[layer-1], parameters[layer]['w']) + parameters[layer]['b']
        l_out = activations[layer](l_in)
        l_in_list.append(l_in)
        l_out_list.append(l_out)

    d_layer = -2 * (onehot[lab] - l_out_list[-1])
    grad_result = [None] * len(dimensions)
    for layer in range(len(parameters)-1, 0, -1):
        if d_type[activations[layer]] == 'dot':
            d_layer = np.dot(differential[activations[layer]](l_in_list[layer]), d_layer)
        if d_type[activations[layer]] == 'times':
            d_layer = d_layer * differential[activations[layer]](l_in_list[layer])
        grad_result[layer] = {}
        grad_result[layer]['b'] = d_layer
        grad_result[layer]['w'] = np.outer(l_out_list[layer-1], d_layer)
        d_layer = np.dot(parameters[layer]['w'], d_layer)
    return grad_result

# ---------- 评估 ----------
def valid_loss(parameters):
    return sum(sqr_loss(valid_img[i], valid_lab[i], parameters) for i in range(valid_num)) / (valid_num / 10000)

def valid_accuracy(parameters):
    correct = [predict(valid_img[i], parameters).argmax() == valid_lab[i] for i in range(valid_num)]
    return correct.count(True) / len(correct)

def train_loss(parameters):
    return sum(sqr_loss(train_img[i], train_lab[i], parameters) for i in range(train_num)) / (train_num / 10000)

def train_accuracy(parameters):
    correct = [predict(train_img[i], parameters).argmax() == train_lab[i] for i in range(train_num)]
    return correct.count(True) / len(correct)

def test_accuracy(parameters):
    correct = [predict(test_img[i], parameters).argmax() == test_lab[i] for i in range(test_num)]
    return correct.count(True) / len(correct)

# ---------- 训练 ----------
def grad_add(grad1, grad2):
    for layer in range(1, len(grad1)):
        for pname in grad1[layer].keys():
            grad1[layer][pname] += grad2[layer][pname]
    return grad1

def grad_divide(grad, denominator):
    for layer in range(1, len(grad)):
        for pname in grad[layer].keys():
            grad[layer][pname] /= denominator
    return grad

def combine_parameters(parameters, grad, learn_rate):
    parameters_tmp = copy.deepcopy(parameters)
    for layer in range(1, len(parameters)):
        for pname in parameters[layer].keys():
            parameters_tmp[layer][pname] -= learn_rate * grad[layer][pname]
    return parameters_tmp

batch_size = 100

def train_batch(current_batch, parameters):
    grad_accu = grad_parameters(train_img[current_batch*batch_size], train_lab[current_batch*batch_size], parameters)
    for img_i in range(1, batch_size):
        grad_tmp = grad_parameters(train_img[current_batch*batch_size+img_i], train_lab[current_batch*batch_size+img_i], parameters)
        grad_add(grad_accu, grad_tmp)
    grad_divide(grad_accu, batch_size)
    return grad_accu

if __name__ == '__main__':
    np.random.seed(1)
    parameters = init_parameters()
    learn_rate = 1
    epoch_num = 10
    for epoch in range(epoch_num):
        for i in range(train_num // batch_size):
            parameters = combine_parameters(parameters, train_batch(i, parameters), learn_rate)
        print(f'epoch {epoch+1}: train_acc={train_accuracy(parameters):.4f}  valid_acc={valid_accuracy(parameters):.4f}  valid_loss={valid_loss(parameters):.1f}')
    print('test accuracy:', test_accuracy(parameters))
```

## 附录 B：本文图片的复现

文中所有图由 `scripts/make_figures.py` 生成（随机种子固定为 1），它把 v1 网络（784→10，5 轮，lr = $10^{-0.6}$）和 v2 网络（784→100→10，10 轮，lr = 1）各训练一遍并保存指标到 `metrics.json`。在我的笔记本上 v1 每轮约 4 秒，v2 每轮约 40 秒，全部跑完约 18 分钟。
