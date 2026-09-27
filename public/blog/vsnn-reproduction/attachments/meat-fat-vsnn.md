# meat_fat runs 001-010 VSNN statistics

- Inputs: 10 runs, 12 model-importance combinations, 120 validated result rows.
- Values are mean +/- sample standard deviation (n-1 denominator).
- Paper comparison uses Rp2(paper) = cor(y, yhat)^2. R2(SSE) is retained as a separate diagnostic.
- OUTSIDE_2SD means the reproduced mean differs from the paper mean by more than two paper standard deviations.

## Reproduction statistics

| Combination | RMSEC | RMSECV | RMSEP | R2(SSE) | Rp2(paper) | nVAR |
|---|---:|---:|---:|---:|---:|---:|
| VS-ANN1-S | 3.218966 +/- 0.025220 | 3.209796 +/- 0.030558 | 3.199845 +/- 0.022575 | 0.918093 +/- 0.001153 | 0.938699 +/- 0.001116 | 20.20 +/- 9.09 |
| VS-ANN1-G | 3.222840 +/- 0.030980 | 3.222805 +/- 0.040049 | 3.206358 +/- 0.020088 | 0.917760 +/- 0.001030 | 0.939081 +/- 0.001471 | 24.10 +/- 13.15 |
| VS-ANN1-Gw | 3.226981 +/- 0.062082 | 3.205245 +/- 0.014652 | 3.186568 +/- 0.058963 | 0.918750 +/- 0.002956 | 0.939941 +/- 0.003969 | 16.00 +/- 6.07 |
| VS-ANN2-S | 0.499240 +/- 0.049199 | 0.821279 +/- 0.042103 | 0.502121 +/- 0.056818 | 0.997960 +/- 0.000472 | 0.998084 +/- 0.000472 | 23.80 +/- 6.78 |
| VS-ANN2-G | 0.498627 +/- 0.053185 | 0.812579 +/- 0.052728 | 0.505722 +/- 0.078282 | 0.997910 +/- 0.000679 | 0.998026 +/- 0.000631 | 27.30 +/- 14.63 |
| VS-ANN2-Gw | 0.516150 +/- 0.053618 | 0.862472 +/- 0.029934 | 0.511326 +/- 0.040373 | 0.997897 +/- 0.000343 | 0.998040 +/- 0.000327 | 29.20 +/- 13.51 |
| VS-CNN1-S | 2.272105 +/- 0.138651 | 2.508761 +/- 0.061794 | 2.225091 +/- 0.137316 | 0.960260 +/- 0.004915 | 0.966731 +/- 0.004029 | 38.10 +/- 14.10 |
| VS-CNN1-G | 2.408329 +/- 0.393319 | 2.465399 +/- 0.072159 | 2.324935 +/- 0.315206 | 0.956047 +/- 0.012647 | 0.963630 +/- 0.008706 | 31.10 +/- 14.69 |
| VS-CNN1-Gw | 2.377087 +/- 0.394662 | 2.477249 +/- 0.044539 | 2.312719 +/- 0.323422 | 0.956462 +/- 0.013001 | 0.964340 +/- 0.008623 | 31.60 +/- 9.16 |
| VS-CNN2-S | 0.337922 +/- 0.034110 | 0.589624 +/- 0.023972 | 0.345357 +/- 0.038987 | 0.999035 +/- 0.000229 | 0.999104 +/- 0.000206 | 57.60 +/- 14.03 |
| VS-CNN2-G | 0.310307 +/- 0.019122 | 0.567058 +/- 0.026447 | 0.324850 +/- 0.018201 | 0.999153 +/- 0.000096 | 0.999211 +/- 0.000091 | 56.60 +/- 14.66 |
| VS-CNN2-Gw | 0.326431 +/- 0.026333 | 0.574631 +/- 0.023173 | 0.332218 +/- 0.039443 | 0.999106 +/- 0.000230 | 0.999171 +/- 0.000216 | 58.90 +/- 18.51 |

## Paper Table 5 comparison

| Combination | Reproduced RMSECV | Paper RMSECV | Status | Reproduced RMSEP | Paper RMSEP | Status | Reproduced Rp2 | Paper Rp2 | Reproduced nVAR | Paper nVAR | Status |
|---|---:|---:|---|---:|---:|---|---:|---:|---:|---:|---|
| VS-ANN1-S | 3.2098 +/- 0.0306 | 3.2600 +/- 0.0140 | OUTSIDE_2SD | 3.1998 +/- 0.0226 | 3.2600 +/- 0.0300 | OUTSIDE_2SD | 0.938699 +/- 0.001116 | 0.915 +/- 0.002 | 20.20 +/- 9.09 | 49.10 +/- 21.31 | WITHIN_2SD |
| VS-ANN1-G | 3.2228 +/- 0.0400 | 3.2600 +/- 0.0120 | OUTSIDE_2SD | 3.2064 +/- 0.0201 | 3.2500 +/- 0.0250 | WITHIN_2SD | 0.939081 +/- 0.001471 | 0.915 +/- 0.001 | 24.10 +/- 13.15 | 47.20 +/- 24.85 | WITHIN_2SD |
| VS-ANN1-Gw | 3.2052 +/- 0.0147 | 3.2500 +/- 0.0090 | OUTSIDE_2SD | 3.1866 +/- 0.0590 | 3.2500 +/- 0.0240 | OUTSIDE_2SD | 0.939941 +/- 0.003969 | 0.915 +/- 0.001 | 16.00 +/- 6.07 | 42.00 +/- 20.81 | WITHIN_2SD |
| VS-ANN2-S | 0.8213 +/- 0.0421 | 0.8700 +/- 0.0220 | OUTSIDE_2SD | 0.5021 +/- 0.0568 | 0.5500 +/- 0.0230 | OUTSIDE_2SD | 0.998084 +/- 0.000472 | 0.998 +/- 0.000 | 23.80 +/- 6.78 | 37.20 +/- 10.55 | WITHIN_2SD |
| VS-ANN2-G | 0.8126 +/- 0.0527 | 0.8300 +/- 0.0320 | WITHIN_2SD | 0.5057 +/- 0.0783 | 0.5400 +/- 0.0390 | WITHIN_2SD | 0.998026 +/- 0.000631 | 0.997 +/- 0.000 | 27.30 +/- 14.63 | 32.60 +/- 11.02 | WITHIN_2SD |
| VS-ANN2-Gw | 0.8625 +/- 0.0299 | 0.8600 +/- 0.0350 | WITHIN_2SD | 0.5113 +/- 0.0404 | 0.5600 +/- 0.0740 | WITHIN_2SD | 0.998040 +/- 0.000327 | 0.997 +/- 0.001 | 29.20 +/- 13.51 | 30.30 +/- 12.33 | WITHIN_2SD |
| VS-CNN1-S | 2.5088 +/- 0.0618 | 2.5300 +/- 0.0630 | WITHIN_2SD | 2.2251 +/- 0.1373 | 2.7900 +/- 0.2290 | OUTSIDE_2SD | 0.966731 +/- 0.004029 | 0.937 +/- 0.010 | 38.10 +/- 14.10 | 37.20 +/- 13.13 | WITHIN_2SD |
| VS-CNN1-G | 2.4654 +/- 0.0722 | 2.6000 +/- 0.0850 | WITHIN_2SD | 2.3249 +/- 0.3152 | 2.6600 +/- 0.3420 | WITHIN_2SD | 0.963630 +/- 0.008706 | 0.943 +/- 0.015 | 31.10 +/- 14.69 | 41.70 +/- 10.93 | WITHIN_2SD |
| VS-CNN1-Gw | 2.4772 +/- 0.0445 | 2.5900 +/- 0.0860 | WITHIN_2SD | 2.3127 +/- 0.3234 | 2.5600 +/- 0.3530 | WITHIN_2SD | 0.964340 +/- 0.008623 | 0.947 +/- 0.015 | 31.60 +/- 9.16 | 46.80 +/- 17.41 | WITHIN_2SD |
| VS-CNN2-S | 0.5896 +/- 0.0240 | 0.5900 +/- 0.0220 | WITHIN_2SD | 0.3454 +/- 0.0390 | 0.3900 +/- 0.0780 | WITHIN_2SD | 0.999104 +/- 0.000206 | 0.999 +/- 0.001 | 57.60 +/- 14.03 | 58.50 +/- 18.45 | WITHIN_2SD |
| VS-CNN2-G | 0.5671 +/- 0.0264 | 0.5800 +/- 0.0320 | WITHIN_2SD | 0.3248 +/- 0.0182 | 0.3900 +/- 0.0930 | WITHIN_2SD | 0.999211 +/- 0.000091 | 0.999 +/- 0.000 | 56.60 +/- 14.66 | 55.30 +/- 13.01 | WITHIN_2SD |
| VS-CNN2-Gw | 0.5746 +/- 0.0232 | 0.5600 +/- 0.0210 | WITHIN_2SD | 0.3322 +/- 0.0394 | 0.3600 +/- 0.0340 | WITHIN_2SD | 0.999171 +/- 0.000216 | 0.999 +/- 0.000 | 58.90 +/- 18.51 | 45.90 +/- 15.08 | WITHIN_2SD |

## Concise conclusion

- Lowest mean RMSEP: VS-CNN2-G (0.324850 +/- 0.018201); second: VS-CNN2-Gw (0.332218 +/- 0.039443).
- The reproduced lowest mean RMSEP is VS-CNN2-G; paper Table 5 reports VS-CNN2-Gw. Both identify the nonlinear CNN2 family as best, while the importance-indicator ordering differs.
- All 12 combinations select wavelengths in the paper-emphasized 890-950 nm fat-related region; the exact frequencies are stored in the wavelength-frequency CSV.
- RMSECV outside two paper standard deviations: VS-ANN1-S, VS-ANN1-G, VS-ANN1-Gw, VS-ANN2-S.
- RMSEP outside two paper standard deviations: VS-ANN1-S, VS-ANN1-Gw, VS-ANN2-S, VS-CNN1-S.
- nVAR outside two paper standard deviations: none. Differences are retained because the paper does not publish the exact 192/48 sample indices.
