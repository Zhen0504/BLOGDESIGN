# corn_oil runs 001-010 VSNN statistics

- Inputs: 10 runs, 12 model-importance combinations, 120 validated result rows.
- Values are mean +/- sample standard deviation (n-1 denominator).
- Paper comparison uses Rp2(paper) = cor(y, yhat)^2. R2(SSE) is retained as a separate diagnostic.
- OUTSIDE_2SD means the reproduced mean differs from the paper mean by more than two paper standard deviations.

## Reproduction statistics

| Combination | RMSEC | RMSECV | RMSEP | R2(SSE) | Rp2(paper) | nVAR |
|---|---:|---:|---:|---:|---:|---:|
| VS-ANN1-S | 0.038596 +/- 0.004988 | 0.044944 +/- 0.006357 | 0.055733 +/- 0.004509 | 0.747464 +/- 0.040076 | 0.797744 +/- 0.028589 | 29.40 +/- 13.92 |
| VS-ANN1-G | 0.040372 +/- 0.003794 | 0.048366 +/- 0.003475 | 0.061160 +/- 0.004621 | 0.696115 +/- 0.042708 | 0.778505 +/- 0.051129 | 38.20 +/- 18.50 |
| VS-ANN1-Gw | 0.041284 +/- 0.003077 | 0.048436 +/- 0.003010 | 0.060624 +/- 0.003131 | 0.702236 +/- 0.030709 | 0.773368 +/- 0.020489 | 37.60 +/- 18.90 |
| VS-ANN2-S | 0.012079 +/- 0.005749 | 0.060819 +/- 0.004009 | 0.083625 +/- 0.011333 | 0.425437 +/- 0.146825 | 0.512827 +/- 0.106741 | 27.10 +/- 8.86 |
| VS-ANN2-G | 0.011097 +/- 0.004078 | 0.060089 +/- 0.004670 | 0.083394 +/- 0.007791 | 0.433488 +/- 0.104485 | 0.518119 +/- 0.084792 | 31.30 +/- 12.68 |
| VS-ANN2-Gw | 0.012446 +/- 0.006330 | 0.060252 +/- 0.003694 | 0.086067 +/- 0.012760 | 0.389442 +/- 0.172940 | 0.517619 +/- 0.112072 | 31.30 +/- 12.68 |
| VS-CNN1-S | 0.010078 +/- 0.005527 | 0.020017 +/- 0.002586 | 0.020097 +/- 0.005789 | 0.964917 +/- 0.021587 | 0.971295 +/- 0.020497 | 40.20 +/- 17.87 |
| VS-CNN1-G | 0.012420 +/- 0.003915 | 0.017830 +/- 0.002852 | 0.019362 +/- 0.004978 | 0.967899 +/- 0.014875 | 0.971619 +/- 0.013554 | 29.00 +/- 12.97 |
| VS-CNN1-Gw | 0.012381 +/- 0.004725 | 0.018620 +/- 0.003371 | 0.022942 +/- 0.009541 | 0.950837 +/- 0.046888 | 0.964433 +/- 0.022816 | 31.80 +/- 17.98 |
| VS-CNN2-S | 0.007013 +/- 0.008225 | 0.049165 +/- 0.010244 | 0.074534 +/- 0.047893 | 0.384146 +/- 0.902687 | 0.634410 +/- 0.296699 | 40.60 +/- 27.02 |
| VS-CNN2-G | 0.014183 +/- 0.006260 | 0.046783 +/- 0.005282 | 0.053751 +/- 0.030940 | 0.696851 +/- 0.401133 | 0.770297 +/- 0.251902 | 17.10 +/- 5.36 |
| VS-CNN2-Gw | 0.007807 +/- 0.007083 | 0.050664 +/- 0.007489 | 0.067155 +/- 0.025574 | 0.587925 +/- 0.292856 | 0.650508 +/- 0.224869 | 32.50 +/- 16.34 |

## Paper Table 3 comparison

| Combination | Reproduced RMSECV | Paper RMSECV | Status | Reproduced RMSEP | Paper RMSEP | Status | Reproduced nVAR | Paper nVAR | Status |
|---|---:|---:|---|---:|---:|---|---:|---:|---|
| VS-ANN1-S | 0.0449 +/- 0.0064 | 0.0397 +/- 0.0036 | WITHIN_2SD | 0.0557 +/- 0.0045 | 0.0624 +/- 0.0050 | WITHIN_2SD | 29.40 +/- 13.92 | 26.70 +/- 11.28 | WITHIN_2SD |
| VS-ANN1-G | 0.0484 +/- 0.0035 | 0.0406 +/- 0.0026 | OUTSIDE_2SD | 0.0612 +/- 0.0046 | 0.0634 +/- 0.0089 | WITHIN_2SD | 38.20 +/- 18.50 | 31.40 +/- 14.49 | WITHIN_2SD |
| VS-ANN1-Gw | 0.0484 +/- 0.0030 | 0.0407 +/- 0.0034 | OUTSIDE_2SD | 0.0606 +/- 0.0031 | 0.0602 +/- 0.0049 | WITHIN_2SD | 37.60 +/- 18.90 | 37.20 +/- 12.13 | WITHIN_2SD |
| VS-ANN2-S | 0.0608 +/- 0.0040 | 0.0609 +/- 0.0050 | WITHIN_2SD | 0.0836 +/- 0.0113 | 0.0890 +/- 0.0100 | WITHIN_2SD | 27.10 +/- 8.86 | 37.40 +/- 19.91 | WITHIN_2SD |
| VS-ANN2-G | 0.0601 +/- 0.0047 | 0.0554 +/- 0.0022 | OUTSIDE_2SD | 0.0834 +/- 0.0078 | 0.0884 +/- 0.0090 | WITHIN_2SD | 31.30 +/- 12.68 | 38.70 +/- 16.79 | WITHIN_2SD |
| VS-ANN2-Gw | 0.0603 +/- 0.0037 | 0.0554 +/- 0.0031 | WITHIN_2SD | 0.0861 +/- 0.0128 | 0.0948 +/- 0.0078 | WITHIN_2SD | 31.30 +/- 12.68 | 32.60 +/- 13.69 | WITHIN_2SD |
| VS-CNN1-S | 0.0200 +/- 0.0026 | 0.0179 +/- 0.0029 | WITHIN_2SD | 0.0201 +/- 0.0058 | 0.0236 +/- 0.0085 | WITHIN_2SD | 40.20 +/- 17.87 | 48.90 +/- 17.01 | WITHIN_2SD |
| VS-CNN1-G | 0.0178 +/- 0.0029 | 0.0186 +/- 0.0032 | WITHIN_2SD | 0.0194 +/- 0.0050 | 0.0289 +/- 0.0071 | WITHIN_2SD | 29.00 +/- 12.97 | 40.20 +/- 15.24 | WITHIN_2SD |
| VS-CNN1-Gw | 0.0186 +/- 0.0034 | 0.0187 +/- 0.0029 | WITHIN_2SD | 0.0229 +/- 0.0095 | 0.0272 +/- 0.0107 | WITHIN_2SD | 31.80 +/- 17.98 | 51.00 +/- 13.74 | WITHIN_2SD |
| VS-CNN2-S | 0.0492 +/- 0.0102 | 0.0439 +/- 0.0077 | WITHIN_2SD | 0.0745 +/- 0.0479 | 0.0614 +/- 0.0242 | WITHIN_2SD | 40.60 +/- 27.02 | 40.90 +/- 24.63 | WITHIN_2SD |
| VS-CNN2-G | 0.0468 +/- 0.0053 | 0.0461 +/- 0.0041 | WITHIN_2SD | 0.0538 +/- 0.0309 | 0.0746 +/- 0.0218 | WITHIN_2SD | 17.10 +/- 5.36 | 46.40 +/- 27.42 | WITHIN_2SD |
| VS-CNN2-Gw | 0.0507 +/- 0.0075 | 0.0459 +/- 0.0051 | WITHIN_2SD | 0.0672 +/- 0.0256 | 0.0688 +/- 0.0229 | WITHIN_2SD | 32.50 +/- 16.34 | 32.20 +/- 17.14 | WITHIN_2SD |

## Concise conclusion

- Lowest mean RMSEP: VS-CNN1-G (0.019362 +/- 0.004978); second: VS-CNN1-S (0.020097 +/- 0.005789).
- The reproduced and paper results agree that the VS-CNN1 family is best overall for corn oil; the reproduced importance-indicator ordering is G, S, Gw by mean RMSEP, while the paper ordering is S, Gw, G.
- RMSECV outside two paper standard deviations: VS-ANN1-G, VS-ANN1-Gw, VS-ANN2-G.
- RMSEP outside two paper standard deviations: none.
- nVAR outside two paper standard deviations: none. The RMSECV differences are retained for final repeated-method discussion.
