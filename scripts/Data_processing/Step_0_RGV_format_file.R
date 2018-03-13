#!/usr/bin/env Rscript
DOC = "This script format file in order to visualize it in RGV gene-level and single-cell tool."

# Define your constants here
  #-- const1 = "first"   --#
  #-- const2 = "second"  --#
  WORKING_DIR = sprintf("%s/%s",getwd(),'RGV_format_tmp_dir')

# Retrieve command line parameters
  if("argparse" %in% rownames(installed.packages()) == FALSE) {install.packages("argparse")}
  if("tools" %in% rownames(installed.packages()) == FALSE) {install.packages("tools")}
  suppressPackageStartupMessages(library(argparse))
  suppressPackageStartupMessages(library(tools))

# Create parser object
  parser <- ArgumentParser(description = DOC)

  parser$add_argument("--rpkm", type="character", help="RPKM genes table", dest="RPKM_TABLE", required = TRUE)
  parser$add_argument("--loc", type="character", help = "Cluster spacial localisation file",dest="LOC_TABLE", required = TRUE)
  parser$add_argument("--map", type="character", help = "Gene symbol to gene ID csv file",dest="MAP_TABLE",default='')
  parser$add_argument("--gtf", type="character", help="Ensembl gtf version associated to gene symbol",dest="GFF_FILE",default='')
  parser$add_argument("--out", type="character", help="Output file",dest="OUTFILE",default='')
  parser$add_argument("-v", "--verbose", action="store_true", default=TRUE, help="Print extra output [default]")
  parser$add_argument("-q", "--quietly", action="store_false", dest="verbose", help="Print little output")
  # Please note: you can add 'required = TRUE' for parameters that are required

  # Parse command line parameters
  args <- parser$parse_args()

# Load your functions here
  #-- Example: source("main.functions.R") --#
  
  #-- Create table gene Symbol; gene IDs --#
  Extract_asso_table  <- function(MAP_TABLE){
    if (args$verbose) {write("Extracting information from association table\n", stdout())}
    if(file_ext(MAP_TABLE) == "csv"){Association.Data     <- as.matrix(read.table(MAP_TABLE,header=TRUE,sep=",",quote=""))}
    if(file_ext(MAP_TABLE) == "tsv"){Association.Data     <- as.matrix(read.table(MAP_TABLE,header=TRUE,sep="\t",quote=""))}
    
    Result.Function <- tryCatch(
      {
        Result.Association.Data             <- matrix(ncol= 1, nrow = length(Association.Data[,2]))
        rownames(Result.Association.Data)   <- Association.Data[,2]
        Result.Association.Data [,1]        <- Association.Data[,1]
        Result.Association.Data
      },
      error=function(cond) {
        message(paste("File caused an error:", MAP_TABLE))
        message("Here's the original error message:")
        message(cond)
        # Choose a return value in case of error
        return(NA)
      },
      warning=function(cond) {
        message(paste("File caused a warning:", MAP_TABLE))
        message("Here's the original warning message:")
        message(cond)
        # Choose a return value in case of warning
        return(NA)
      }
    )    
    return(Result.Function)
  }
  
  #-- Create table gene Symbol; gene IDs from gtf file--#
  Extract_gff  <- function(GTF_FILE){
    if (args$verbose) {write("Extracting information from gtf file\n", stdout())}
    Result.Function <- tryCatch(
      {
        Association.Data                    <- as.matrix(read.table(GTF_FILE,header=FALSE,sep="\t",quote="", skip = 5))
        Genes.Association.Data              <- Association.Data[which(Association.Data[,3] == "gene"),]
        Genes.IDs.Association.Data          <- gsub('gene_id |\"','',sapply(strsplit(Genes.Association.Data[,9],";"), `[`, 1))
        Genes.Symbol.Association.Data       <- gsub('gene_name |\"| ','',sapply(strsplit(Genes.Association.Data[,9],";"), `[`, 3))
        Result.Association.Data             <- matrix(ncol= 1, nrow = length(Genes.Symbol.Association.Data))
        rownames(Result.Association.Data)   <- Genes.Symbol.Association.Data
        Result.Association.Data [,1]        <- Genes.IDs.Association.Data
        Result.Association.Data
      },
      error=function(cond) {
        message(paste("Error during parsing the gtf file:", MAP_TABLE))
        message("Here's the original error message:")
        message(cond)
        # Choose a return value in case of error
        return(NA)
      },
      warning=function(cond) {
        message(paste("File caused a warning:", MAP_TABLE))
        message("Here's the original warning message:")
        message(cond)
        # Choose a return value in case of warning
        return(NA)
      }
    ) 
    
    return(Result.Function)
  }
  
  #-- Create RGV file --#
  Format_file  <- function(RPKM_TABLE,LOC_TABLE,MAP_TABLE,GTF_FILE,OUTFILE){
    if (args$verbose) {
      write("Formating RGV file\n", stdout())
      write(paste("\tMAP_TABLE value:  ", MAP_TABLE), stdout())
      write(paste("\tGTF_FILE value:  ", GTF_FILE), stdout())
    }
    
    #Check Association table provided (csv or gtf)
    if(is.null(MAP_TABLE)){if (args$verbose) {write("No association table provided", stdout())}}else{Gene.Data <- Extract_asso_table(MAP_TABLE)}
    if(is.null(GTF_FILE)){if (args$verbose) {write("No gtf file provided", stdout())}}else{Gene.Data <- Extract_gff(GTF_FILE)}
    
    Result.Function <- tryCatch(
      {
        if (args$verbose) {write("Formating Step 1/3", stdout())}
        Expr.Data     <- as.matrix(read.csv(RPKM_TABLE,header=TRUE,row.names=1))
        Class.Data    <- as.matrix(read.csv(LOC_TABLE,header=TRUE,row.names=1))
        
        #-----------------------------------------------------------------------
        if (args$verbose) {write("Formating Step 2/3", stdout())}
        Common.samples      <- intersect(colnames(Expr.Data),rownames(Class.Data))
        Expr.Data           <- Expr.Data[,Common.samples]
        Class.Data          <- Class.Data[Common.samples,]
        rownames(Expr.Data) <- gsub("\\..*$","",as.vector(Gene.Data[rownames(Expr.Data),]))
        #-----------------------------------------------------------------------
        
        #-----------------------------------------------------------------------
        if (args$verbose) {write("Formating Step 3/3", stdout())}
        Classes    <- sprintf("Class:%s",colnames(Class.Data)[3:ncol(Class.Data)])
        m <- matrix(nrow=0,ncol=ncol(Expr.Data))
        for (i in 1:length(Classes)) {
          m <- rbind(m,matrix(Class.Data[,i+2],nrow=1,dimnames=list(c(Classes[i]),colnames(Expr.Data))))
        }
        m <- rbind(m,matrix(as.double(as.vector(Class.Data[,1] )),nrow=1,dimnames=list(c("X"),colnames(Expr.Data))))
        m <- rbind(m,matrix(as.double(as.vector(Class.Data[,2] )),nrow=1,dimnames=list(c("Y"),colnames(Expr.Data))))
        m <- rbind(m,Expr.Data)
        #-----------------------------------------------------------------------
        if (args$verbose) {write("Writting file", stdout())}
        write.table(m,file=OUTFILE ,quote=FALSE,sep="\t",col.names=NA,row.names=TRUE)
      },
      error=function(cond) {
        message(paste("Error during the file conversion:", OUTFILE))
        message("Here's the original error message:")
        message(cond)
        # Choose a return value in case of error
        return(NA)
      },
      warning=function(cond) {
        message(paste("File caused a warning:", OUTFILE))
        message("Here's the original warning message:")
        message(cond)
        # Choose a return value in case of warning
        return(NA)
      }
    ) 
    
  }

# Print inputs only if cmnd-line parameters correct and verbose 'true' (in case of errors, use 'sterr()')
if (args$verbose) {
  write("You have used the following arguments:", stdout())
  write(paste("\t--rpkm:  ", args$RPKM_TABLE), stdout())
  write(paste("\t--loc:  ", args$LOC_TABLE), stdout())
  write(paste("\t--map:  ", args$MAP_TABLE), stdout())
  
}
  
# Do some operations based on user input
  if (args$OUTFILE == '') {OUT.FILE = sprintf("%s/%s",WORKING_DIR,"RGV_formated_file.txt")}else{OUT.FILE = args$OUTFILE}
  if(args$MAP_TABLE != '') {
    write("\nStart processing...\n", stdout())
    dir.create(c(WORKING_DIR),recursive=TRUE,showWarnings=FALSE);
    Format_file(args$RPKM_TABLE,args$LOC_TABLE,args$MAP_TABLE,NULL,OUT.FILE)
  }
  if(args$GFF_FILE != '') {
    write("\nStart processing...\n", stdout())
    dir.create(c(WORKING_DIR),recursive=TRUE,showWarnings=FALSE);
    Format_file(args$RPKM_TABLE,args$LOC_TABLE,NULL,args$GFF_FILE,OUT.FILE)
  }