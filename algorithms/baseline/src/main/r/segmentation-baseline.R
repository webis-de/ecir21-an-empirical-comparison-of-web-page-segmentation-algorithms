#!/usr/bin/env Rscript

################################################################################
## LOADING SEGMENTATION LIBRARY
################################################################################

rscript.options <- commandArgs(trailingOnly = FALSE)
source.dir <- dirname(sub(".*=", "", rscript.options[grep("--file=", rscript.options)]))
source(paste(source.dir, "..", "..", "..", "..", "..", "cikm20", "src", "main", "r", "segmentations", "lib.R", sep="/"))



################################################################################
## OPTIONS
################################################################################

library("optparse")

option_list <- list(
    make_option("--input", type="character", help="Screenshot to segment"),
    make_option("--id", type="character", default=NULL, help="ID of the task (instead of using the screenshot's directory name)"),
    make_option("--output", type="character", help="Output JSON file with the segmentation")
  )

options.parser <- OptionParser(option_list=option_list)
options <- parse_args(options.parser)
if (is.null(options$input)) {
  print_help(options.parser)
  stop("Missing input file", call.=FALSE)
}
if (is.null(options$output)) {
  print_help(options.parser)
  stop("Missing output file", call.=FALSE)
}



################################################################################
## EXECUTION
################################################################################

task <- Task(id = options$id, screenshotFile = options$input)
segment <- Segment(c(0,0,task$width,task$width), c(0,task$height,task$height,0))
task$segmentations[["baseline"]] <- list(segment)

WriteTask(task, options$output)

