# Corn oil JMIM runs 001-010 statistics

- Inputs: 10 runs and 40 validated formal result rows.
- Values are mean +/- sample standard deviation; paper values are Table 3 mean +/- standard deviation.
- Rp2(paper) and R2(SSE) remain separate metrics.

| Model | RMSECV | Paper | RMSEP | Paper | Rp2(paper) | Paper | nVAR | Paper |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| JMIM-ANN1 | 0.0544 +/- 0.0004 | 0.0570 +/- 0.0003 | 0.0556 +/- 0.0012 | 0.0520 +/- 0.0007 | 0.767810 +/- 0.010327 | 0.852 +/- 0.004 | 341.50 +/- 7.09 | 310.50 +/- 21.14 |
| JMIM-ANN2 | 0.0900 +/- 0.0034 | 0.0800 +/- 0.0038 | 0.1172 +/- 0.0097 | 0.1090 +/- 0.0107 | 0.279964 +/- 0.081193 | 0.481 +/- 0.129 | 313.00 +/- 25.84 | 327.50 +/- 18.45 |
| JMIM-CNN1 | 0.0497 +/- 0.0007 | 0.0420 +/- 0.0019 | 0.0454 +/- 0.0036 | 0.0480 +/- 0.0052 | 0.898429 +/- 0.015043 | 0.881 +/- 0.030 | 329.00 +/- 17.61 | 306.00 +/- 36.88 |
| JMIM-CNN2 | 0.0764 +/- 0.0036 | 0.0700 +/- 0.0041 | 0.0999 +/- 0.0087 | 0.0890 +/- 0.0207 | 0.312012 +/- 0.074694 | 0.578 +/- 0.172 | 302.00 +/- 19.75 | 317.50 +/- 27.31 |

## Concise conclusion

- Lowest mean RMSEP: JMIM-CNN1 (0.0454 +/- 0.0036); Table 3 also identifies JMIM-CNN1 as best.
- The best-model identity agrees; JMIM-CNN1 is best by the predeclared primary RMSEP criterion.
- RMSECV outside paper mean +/- 2 paper SD: ANN1, ANN2, CNN1.
- RMSEP outside paper mean +/- 2 paper SD: ANN1.
- nVAR outside paper mean +/- 2 paper SD: none.
- All ten Corn oil runs completed without a multi-attempt formal log; exact numerical differences from Table 3 remain visible rather than being normalized away.
- The ranking source is the independently reproduced mifs JMIM implementation pinned by dataset, ranking-list, and ranking-content hashes.
