# Corn moisture JMIM runs 001-010 statistics

- Inputs: 10 runs and 40 validated formal result rows.
- Values are mean +/- sample standard deviation; paper values are Table 2 mean +/- standard deviation.
- Rp2(paper) and R2(SSE) remain separate metrics.

| Model | RMSECV | Paper | RMSEP | Paper | Rp2(paper) | Paper | nVAR | Paper |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| JMIM-ANN1 | 0.0287 +/- 0.0007 | 0.0240 +/- 0.0005 | 0.0187 +/- 0.0014 | 0.0220 +/- 0.0011 | 0.996810 +/- 0.000443 | 0.099 +/- 0.000 | 307.00 +/- 22.75 | 345.50 +/- 3.69 |
| JMIM-ANN2 | 0.0805 +/- 0.0046 | 0.1035 +/- 0.0070 | 0.0854 +/- 0.0205 | 0.1090 +/- 0.0159 | 0.947286 +/- 0.027460 | 0.797 +/- 0.061 | 305.00 +/- 13.54 | 326.50 +/- 10.55 |
| JMIM-CNN1 | 0.0106 +/- 0.0002 | 0.0150 +/- 0.0010 | 0.0105 +/- 0.0016 | 0.0130 +/- 0.0039 | 0.999016 +/- 0.000393 | 0.976 +/- 0.001 | 329.50 +/- 17.55 | 335.50 +/- 12.57 |
| JMIM-CNN2 | 0.0330 +/- 0.0028 | 0.0620 +/- 0.0102 | 0.0251 +/- 0.0074 | 0.0510 +/- 0.0260 | 0.994363 +/- 0.003148 | 0.906 +/- 0.038 | 292.00 +/- 16.53 | 328.00 +/- 16.86 |

## Concise conclusion

- Lowest mean RMSEP: JMIM-CNN1 (0.0105 +/- 0.0016); Table 2 also identifies JMIM-CNN1 as best.
- The best-model identity agrees; JMIM-CNN1 is best by the predeclared primary RMSEP criterion.
- RMSECV outside paper mean +/- 2 paper SD: ANN1, ANN2, CNN1, CNN2.
- RMSEP outside paper mean +/- 2 paper SD: ANN1.
- nVAR outside paper mean +/- 2 paper SD: ANN1, ANN2, CNN2.
- Exact differences are retained; one prior interrupted run004-CNN1 attempt remains auditable in the same log, while its final 70-candidate attempt is complete and solely produced the formal result.
- Paper Table 2 reports JMIM-ANN1 Rp2=0.099; it is preserved verbatim and flagged as a suspected typesetting error rather than silently changed.
