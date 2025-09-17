package email.smart_assistant.controller;

import email.smart_assistant.dto.EmailRequest;
import email.smart_assistant.service.EmailService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/email/")
@CrossOrigin(origins="*")
@AllArgsConstructor
public class EmailGeneratorController {

    final private EmailService emailService;

    @PostMapping("generate")
    public ResponseEntity<?> emailGeneratorController(@RequestBody EmailRequest emailrequest){
        return ResponseEntity.ok(emailService.generateEmailReply(emailrequest));
    }
}
