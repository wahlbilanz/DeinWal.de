
votes <- read.table (file="results.table", header=TRUE, sep="\t")
m=as.matrix (votes[,2:6])
rownames(m)<-votes[,1]

pdf ("parteimap.pdf", height=20)
heatmap.2(m,tracecol=1, cexCol=.9)
dev.off()
