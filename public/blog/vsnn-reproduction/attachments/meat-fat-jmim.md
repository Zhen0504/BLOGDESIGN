# Meat fat JMIM runs 001-010 statistics

- Inputs: 10 runs and 40 validated formal result rows.
- Values are mean +/- sample standard deviation; paper values are Table 5 mean +/- standard deviation.
- Rp2(paper) and R2(SSE) remain separate metrics.

| Model | RMSECV | Paper | RMSEP | Paper | Rp2(paper) | Paper | nVAR | Paper |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| JMIM-ANN1 | 3.4120 +/- 0.0137 | 3.3800 +/- 0.0160 | 3.2809 +/- 0.0192 | 3.3500 +/- 0.0780 | 0.941592 +/- 0.000570 | 0.862 +/- 0.007 | 35.00 +/- 0.00 | 42.00 +/- 6.32 |
| JMIM-ANN2 | 1.0893 +/- 0.0353 | 1.0700 +/- 0.0230 | 0.7230 +/- 0.0592 | 0.7300 +/- 0.0330 | 0.996078 +/- 0.000676 | 0.996 +/- 0.000 | 43.50 +/- 4.74 | 44.00 +/- 4.59 |
| JMIM-CNN1 | 3.1518 +/- 0.0351 | 3.2000 +/- 0.0480 | 3.3757 +/- 0.0798 | 3.3100 +/- 0.0330 | 0.939120 +/- 0.004521 | 0.872 +/- 0.005 | 33.00 +/- 13.98 | 45.50 +/- 4.38 |
| JMIM-CNN2 | 0.9906 +/- 0.0281 | 0.9700 +/- 0.0400 | 0.5118 +/- 0.0836 | 0.5400 +/- 0.0490 | 0.997900 +/- 0.000779 | 0.998 +/- 0.000 | 47.00 +/- 3.50 | 44.00 +/- 4.59 |

## Concise conclusion

- Lowest mean RMSEP: JMIM-CNN2 (0.5118 +/- 0.0836); paper also identifies JMIM-CNN2 as best.
- ANN2/CNN2 outperform ANN1/CNN1, reproducing the paper's nonlinear-model conclusion.
- RMSECV outside paper mean +/- 2 paper SD: ANN1.
- RMSEP outside paper mean +/- 2 paper SD: none.
- nVAR outside paper mean +/- 2 paper SD: CNN1.
- Exact differences are retained; the paper does not publish the precise 192/48 sample indices or random seeds.
