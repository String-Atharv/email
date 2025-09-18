package email.smart_assistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import email.smart_assistant.dto.EmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;



@Service
public class EmailService {
    private final WebClient webClient;

    public EmailService(WebClient.Builder webClientBuilder){
        this.webClient=webClientBuilder.build();
    }

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;


    public String BuildPrompt(EmailRequest emailRequest){
        StringBuilder tempPrompt=new StringBuilder();
        tempPrompt.append("Generate the"+emailRequest.getEmailTone()+"email reply for the following email.please don't generate subject line");
        tempPrompt.append("\n Original Email: \n").append(emailRequest.getEmailBody());
        String prompt=tempPrompt.toString();
        return prompt;
    }



    // generateEmailReply
    public String generateEmailReply(EmailRequest emailRequest){
        // build the prompt
        String prompt=BuildPrompt(emailRequest);
        // Craft the request
        Map<String,Object> requestBody=Map.of("contents",new Object[]{
                Map.of("parts",new Object[]{
                        Map.of("text",prompt)
                })
        });
        // do the request & get response
        String response=webClient.post()
                .uri(geminiApiUrl+"?key="+geminiApiKey)
                .header("Content-Type","application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class) // result will be not available immediately , it will be availale later
                .block(); // waits for gemini api's reply. as reponse arrives you can do your further task

        // return response

        return extractedReponse(response);


    }

    private String extractedReponse(String response) {
        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node=mapper.readTree(response);
            String extractedResponse=node.path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text")
                    .asText();
            return extractedResponse;
        }
        catch (Exception e){
        return "error processing request "+e.getMessage();
        }
    }

}
