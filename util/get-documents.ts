import { TextLoader } from "https://esm.sh/langchain/document_loaders/fs/text"

const segmentationStartReg = /\*\*Suggested Assessment Rubrics:?\*\*/g
const segmentationStart = '**Suggested Assessment Rubrics**'

const getDocuments = async () => {
    const loader = new TextLoader("docs/curriculum.md")
    const document = (await loader.load() as {
        pageContent: string,
        metadata: Record<string, unknown>,
    }[])[0]
    const regex = /<a[^>]*>[^<]*<\/a>/g;
    const chapters = document.pageContent.split(regex)
    const segments = chapters.reduce<string[]>((segments, chapter) => {
        if (!chapter.match(segmentationStartReg)) {
            segments.push(chapter)
            return segments
        }
        const [chapterTitle, ...chapterContent] = chapter.split('\n')
        const chapterContentString = chapterContent.join('\n')
        const newSegments = chapterContentString.split(segmentationStartReg).map(
            (segment, index) => index !== 0 ?
                `${chapterTitle}\n${segmentationStart}\n${segment}`
                : `${chapterTitle}\n${segment}`
        )

        return [...segments, ...newSegments]
    }, [])

    return segments.map((segments, index) => ({ pageContent: segments, metadata: { index } }))
}

export default getDocuments
